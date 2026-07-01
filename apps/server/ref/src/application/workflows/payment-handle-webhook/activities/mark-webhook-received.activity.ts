/**
 * Mark Webhook Received Activity
 *
 * Idempotency checkpoint - marks webhook as received immediately.
 * This runs in a SEPARATE transaction before processing to ensure:
 * - Even if processing fails later, we know webhook arrived
 * - Prevents duplicate processing on provider retry
 * - Immediate audit trail with WEBHOOK_RECEIVED event
 */

import { PaymentService } from '@/application/services/payment.service';
import { Injectable, Inject } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { MARK_WEBHOOK_RECEIVED_ACTIVITY } from '../payment-handle-webhook.token';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import {
	PaymentNotFoundException,
	EPaymentAttemptStatus,
	PaymentAttemptEntity,
	PaymentException,
} from '@/core';
import { toError } from '@/shared/utils/error.util';
import { EPaymentEventType, PaymentEventEntity } from '@/core';

// Input/Output schemas
const MarkWebhookReceivedInputSchema = z.object({
	paymentId: z.string(),
	attemptId: z.string(),
});

const MarkWebhookReceivedOutputSchema = z.object({
	success: z.boolean(),
	alreadyReceived: z.boolean(),
	oldAttemptStatus: z.enum(EPaymentAttemptStatus),
	newAttemptStatus: z.enum(EPaymentAttemptStatus),
});

type MarkWebhookReceivedInput = z.infer<typeof MarkWebhookReceivedInputSchema>;
type MarkWebhookReceivedOutput = z.infer<typeof MarkWebhookReceivedOutputSchema>;

@Injectable()
@Activity(MARK_WEBHOOK_RECEIVED_ACTIVITY)
@ActivityValidation({
	input: MarkWebhookReceivedInputSchema,
	output: MarkWebhookReceivedOutputSchema,
})
export class MarkWebhookReceivedActivity {
	constructor(
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService,
		private readonly paymentService: PaymentService
	) {}

	async execute(input: MarkWebhookReceivedInput): Promise<MarkWebhookReceivedOutput> {
		const { paymentId, attemptId } = input;

		this.logger.log(`Marking webhook received for payment: ${paymentId}`);

		const session = await this.uow.start();
		try {
			const payment = await session.paymentRepository.findById(paymentId);
			if (!payment) {
				throw new PaymentNotFoundException(paymentId);
			}

			const attempt = payment.getAttemptById(attemptId);
			if (!attempt) {
				throw new PaymentException(`Attempt ${attemptId} not found`);
			}
			const oldAttemptProps = { ...attempt.getProps() };
			if (oldAttemptProps.transactions) {
				oldAttemptProps.transactions = [...oldAttemptProps.transactions];
			}
			const oldAttempt = PaymentAttemptEntity.instantiate(attempt.id, oldAttemptProps);

			// Mark webhook as received via PaymentService
			const { oldPaymentAttemptStatus, newPaymentAttemptStatus } =
				this.paymentService.handleWebhook(payment, attemptId);

			// Check if already received (idempotency)
			const alreadyReceived = oldPaymentAttemptStatus === newPaymentAttemptStatus;

			if (alreadyReceived) {
				this.logger.log(`Webhook already received for payment: ${paymentId} (idempotent)`);
			}

			// Save payment immediately
			await session.paymentRepository.save(payment);

			// Publish WEBHOOK_RECEIVED event
			const changes = PaymentAttemptEntity.getFieldChanges(oldAttempt, attempt);
			const webhookEvent = PaymentEventEntity.create({
				paymentId: payment.id,
				paymentAttemptId: attemptId,
				eventType: EPaymentEventType.WEBHOOK_RECEIVED,
				triggerType: 'SYSTEM',
				triggeredBy: 'provider',
				fieldChanges: changes,
				occurredAt: new Date(),
			});

			await session.auditRepository.save(webhookEvent);

			// Commit immediately (even if later processing fails)
			await session.commit();

			this.logger.log(`Webhook marked as received for payment: ${paymentId}`);

			return {
				success: true,
				alreadyReceived,
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
