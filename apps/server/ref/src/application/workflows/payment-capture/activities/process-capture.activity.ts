/**
 * Process Capture Result Activity
 *
 * Processes the capture result from payment provider.
 * Records transaction, transitions payment status, and publishes events.
 */

import { PaymentService } from '@/application/services/payment.service';
import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { PROCESS_CAPTURE_ACTIVITY } from '../payment-capture.token';
import { EVENT_SERVICE, type IEventService } from '@/core';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import {
	ETransactionStatus,
	EPaymentTransactionType,
	ETransactionSource,
	PaymentTransactionEntity,
	PaymentNotFoundException,
	MoneyVO,
	PaymentEntity,
	PaymentAttemptEntity,
	EPaymentStatus,
	EPaymentAttemptStatus,
	EPaymentEventType,
	PaymentEventEntity,
	BillNotFoundException,
	PaymentException,
} from '@/core';
import { toError } from '@/shared/utils/error.util';
import { ECurrency } from '@/core';

// Input/Output schemas
const ProcessCaptureInputSchema = z.object({
	paymentId: z.string(),
	attemptId: z.string(),
	captureAmount: z.number().positive(),
	currency: z.string(),
	result: z.object({
		isSuccess: z.boolean(),
		data: z.looseObject({
			transactionId: z.string().optional(),
		}),
		requestPayload: z.record(z.string(), z.unknown()).optional(),
		responsePayload: z.record(z.string(), z.unknown()).optional(),
		requestHeaders: z.record(z.string(), z.string()).optional(),
		responseHeaders: z.record(z.string(), z.string()).optional(),
		requestTimestamp: z.string().transform((val) => new Date(val)),
		responseTimestamp: z.string().transform((val) => new Date(val)),
	}),
});

const ProcessCaptureOutputSchema = z.object({
	success: z.boolean(),
});

type ProcessCaptureInput = z.infer<typeof ProcessCaptureInputSchema>;
type ProcessCaptureOutput = z.infer<typeof ProcessCaptureOutputSchema>;

@Injectable()
@Activity(PROCESS_CAPTURE_ACTIVITY)
@ActivityValidation({
	input: ProcessCaptureInputSchema,
	output: ProcessCaptureOutputSchema,
})
export class ProcessCaptureActivity {
	constructor(
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService,
		@Inject(EVENT_SERVICE) private readonly eventService: IEventService,
		private readonly paymentService: PaymentService
	) {}

	async execute(input: ProcessCaptureInput): Promise<ProcessCaptureOutput> {
		const { paymentId, attemptId, captureAmount, currency, result } = input;
		this.logger.log(`Processing capture result for payment ${paymentId}`);

		const session = await this.uow.start();
		try {
			const payment = await session.paymentRepository.findById(paymentId);
			if (!payment) throw new PaymentNotFoundException(paymentId);

			// 2. Create capture transaction via Domain Entity factory
			const transaction = PaymentTransactionEntity.fromProvider({
				transactionType: EPaymentTransactionType.CAPTURE,
				transactionSource: ETransactionSource.API,
				status: result.isSuccess ? ETransactionStatus.SUCCESS : ETransactionStatus.FAILED,
				amount: new MoneyVO(captureAmount, currency as ECurrency),
				providerTransactionId: result.data.transactionId,
				requestPayload: result.requestPayload,
				responsePayload: result.responsePayload,
				requestHeaders: result.requestHeaders,
				responseHeaders: result.responseHeaders,
				requestTimestamp: result.requestTimestamp,
				responseTimestamp: result.responseTimestamp,
				description: 'Capture transaction',
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

			// 4. Update bill status if payment successful (via PaymentService coordination)
			if (result.isSuccess && payment.billId) {
				const bill = await session.billRepository.findById(payment.billId);
				if (!bill) {
					throw new BillNotFoundException(payment.billId);
				}
				this.paymentService.coordinateCaptureSuccess(payment, bill);
				await session.billRepository.save(bill);
			}

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

			// Save domain events to outbox (within the same transaction!)
			await this.eventService.publishEvents(payment, session);

			await session.commit();

			this.logger.log(`Successfully processed capture for payment ${paymentId}`);

			return {
				success: result.isSuccess,
			};
		} catch (e) {
			await session.rollback();
			throw toError(e);
		} finally {
			await session.end();
		}
	}
}
