/**
 * Process Webhook Result Activity
 *
 * Records transaction and updates payment state based on webhook data.
 * Steps:
 * 1. Fetch payment
 * 2. Create PaymentTransactionEntity with ETransactionSource.WEBHOOK
 * 3. Add transaction to payment attempt
 * 4. Transition payment status if needed
 * 5. Publish domain events (BEFORE commit for atomicity)
 * 6. Save payment
 *
 * Domain events trigger subsequent async workflows (capture, refund, etc.)
 */

import { PaymentService } from '@/application/services/payment.service';
import { Injectable, Inject } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { PROCESS_WEBHOOK_RESULT_ACTIVITY } from '../payment-handle-webhook.token';
import { EVENT_SERVICE, type IEventService } from '@/core';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import {
	PaymentNotFoundException,
	PaymentTransactionEntity,
	MoneyVO,
	EPaymentTransactionType,
	ETransactionSource,
	ETransactionStatus,
	EPaymentStatus,
	EPaymentAttemptStatus,
	OutboxEntity,
	PaymentEntity,
	PaymentAttemptEntity,
	EPaymentEventType,
	PaymentEventEntity,
	PaymentException,
} from '@/core';
import { toError } from '@/shared/utils/error.util';
import { ECurrency } from '@/core';

// Input/Output schemas
const ProcessWebhookResultInputSchema = z.object({
	paymentId: z.string(),
	attemptId: z.string(),
	transactionType: z.enum(EPaymentTransactionType),
	amount: z.number(),
	currency: z.string(),
	data: z.object({
		transactionId: z.string().optional(),
		isSuccess: z.boolean(),
		status: z.string(),
		errorMessage: z.string().optional(),
	}),
	rawPayload: z.record(z.string(), z.unknown()),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

const ProcessWebhookResultOutputSchema = z.object({
	success: z.boolean(),
	oldPaymentStatus: z.enum(EPaymentStatus),
	newPaymentStatus: z.enum(EPaymentStatus),
	oldAttemptStatus: z.enum(EPaymentAttemptStatus),
	newAttemptStatus: z.enum(EPaymentAttemptStatus),
});

type ProcessWebhookResultInput = z.infer<typeof ProcessWebhookResultInputSchema>;
type ProcessWebhookResultOutput = z.infer<typeof ProcessWebhookResultOutputSchema>;

@Injectable()
@Activity(PROCESS_WEBHOOK_RESULT_ACTIVITY)
@ActivityValidation({
	input: ProcessWebhookResultInputSchema,
	output: ProcessWebhookResultOutputSchema,
})
export class ProcessWebhookResultActivity {
	constructor(
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService,
		@Inject(EVENT_SERVICE) private readonly eventService: IEventService,
		private readonly paymentService: PaymentService
	) {}

	async execute(input: ProcessWebhookResultInput): Promise<ProcessWebhookResultOutput> {
		const {
			paymentId,
			attemptId,
			transactionType,
			amount,
			currency,
			data,
			rawPayload,
			metadata,
		} = input;

		this.logger.log(`Processing webhook result for payment: ${paymentId}`);

		const session = await this.uow.start();
		try {
			// 1. Fetch payment
			const payment = await session.paymentRepository.findById(paymentId);
			if (!payment) {
				throw new PaymentNotFoundException(paymentId);
			}

			// 2. Create PaymentTransactionEntity via Domain Entity factory
			const transaction = PaymentTransactionEntity.fromProvider({
				transactionType,
				transactionSource: ETransactionSource.WEBHOOK, // ✅ Webhook source
				amount: new MoneyVO(amount, currency as ECurrency),
				status: data.isSuccess ? ETransactionStatus.SUCCESS : ETransactionStatus.FAILED,
				description: data.errorMessage || undefined,
				providerTransactionId: data.transactionId,
				responsePayload: rawPayload,
				responseTimestamp: new Date(),
				metadata,
			});

			// Capture old payment and attempt states
			const oldPaymentProps = { ...payment.getProps() };
			if (oldPaymentProps.paymentAttempts) {
				oldPaymentProps.paymentAttempts = [...oldPaymentProps.paymentAttempts];
			}
			const oldPayment = PaymentEntity.instantiate(payment.id, oldPaymentProps);

			const attempt = payment.getAttemptById(attemptId);
			if (!attempt) {
				throw new PaymentException(`Attempt ${attemptId} not found`);
			}
			const oldAttemptProps = { ...attempt.getProps() };
			if (oldAttemptProps.transactions) {
				oldAttemptProps.transactions = [...oldAttemptProps.transactions];
			}
			const oldAttempt = PaymentAttemptEntity.instantiate(attempt.id, oldAttemptProps);

			// 3. Add transaction and process transitions via PaymentService
			const {
				oldPaymentStatus,
				oldPaymentAttemptStatus,
				newPaymentStatus,
				newPaymentAttemptStatus,
			} = this.paymentService.processTransaction(payment, attemptId, transaction);

			// 4. Save payment
			await session.paymentRepository.save(payment);

			// Determine and record audit event
			let eventType: EPaymentEventType | null = null;
			let fieldChanges = {};

			if (
				newPaymentStatus === EPaymentStatus.COMPLETED &&
				oldPaymentStatus !== EPaymentStatus.COMPLETED
			) {
				eventType = EPaymentEventType.PAYMENT_SUCCEEDED;
				fieldChanges = PaymentEntity.getFieldChanges(oldPayment, payment);
			} else if (
				newPaymentStatus === EPaymentStatus.FAILED &&
				oldPaymentStatus !== EPaymentStatus.FAILED
			) {
				eventType = EPaymentEventType.PAYMENT_FAILED;
				fieldChanges = PaymentEntity.getFieldChanges(oldPayment, payment);
			} else if (
				newPaymentAttemptStatus === EPaymentAttemptStatus.SUCCESS &&
				oldPaymentAttemptStatus !== EPaymentAttemptStatus.SUCCESS
			) {
				eventType = EPaymentEventType.ATTEMPT_SUCCEEDED;
				fieldChanges = PaymentAttemptEntity.getFieldChanges(oldAttempt, attempt);
			} else if (
				newPaymentAttemptStatus === EPaymentAttemptStatus.FAILED &&
				oldPaymentAttemptStatus !== EPaymentAttemptStatus.FAILED
			) {
				eventType = EPaymentEventType.ATTEMPT_FAILED;
				fieldChanges = PaymentAttemptEntity.getFieldChanges(oldAttempt, attempt);
			}

			if (eventType) {
				await session.auditRepository.save(
					PaymentEventEntity.create({
						paymentId: payment.id,
						paymentAttemptId: attemptId,
						eventType,
						triggerType: 'SYSTEM',
						triggeredBy: 'system',
						fieldChanges,
						occurredAt: new Date(),
					})
				);
			}

			// 5. Save domain events to outbox (within the same transaction!)
			await this.eventService.publishEvents(payment, session);

			await session.commit();

			this.logger.log(
				`Webhook processed: ${oldPaymentStatus} → ${newPaymentStatus}, ${oldPaymentAttemptStatus} → ${newPaymentAttemptStatus}`
			);

			return {
				success: true,
				oldPaymentStatus,
				newPaymentStatus,
				oldAttemptStatus: oldPaymentAttemptStatus,
				newAttemptStatus: newPaymentAttemptStatus,
			};
		} catch (error) {
			await session.rollback();
			throw toError(error);
		} finally {
			await session.end();
		}
	}
}
