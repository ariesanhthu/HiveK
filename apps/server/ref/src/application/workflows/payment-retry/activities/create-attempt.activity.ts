/**
 * Create Attempt Activity
 *
 * Creates a new payment attempt for retry.
 * Uses payment.retry() domain method to create the attempt.
 */

import { PaymentService } from '@/application/services/payment.service';
import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { CREATE_ATTEMPT_ACTIVITY } from '../payment-retry.token';
import { EVENT_SERVICE, type IEventService } from '@/core';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import {
	PaymentNotFoundException,
	PaymentEntity,
	PaymentEventEntity,
	EPaymentEventType,
} from '@/core';
import { getErrorMessage, toError } from '@/shared/utils/error.util';

// Input/Output schemas
const CreateAttemptInputSchema = z.object({
	paymentId: z.string(),
	paymentProviderId: z.string(),
	idempotencyKey: z.string(),
});

const CreateAttemptOutputSchema = z.object({
	attemptId: z.string(),
});

export type CreateAttemptInput = z.infer<typeof CreateAttemptInputSchema>;
export type CreateAttemptOutput = z.infer<typeof CreateAttemptOutputSchema>;

@Injectable()
@Activity(CREATE_ATTEMPT_ACTIVITY)
@ActivityValidation({
	input: CreateAttemptInputSchema,
	output: CreateAttemptOutputSchema,
})
export class CreateAttemptActivity {
	constructor(
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService,
		@Inject(EVENT_SERVICE) private readonly eventService: IEventService,
		private readonly paymentService: PaymentService
	) {}

	async execute(input: CreateAttemptInput): Promise<CreateAttemptOutput> {
		const { paymentId, paymentProviderId, idempotencyKey } = input;

		this.logger.log(
			`Creating retry attempt for payment ${paymentId} with provider ${paymentProviderId}`
		);

		const session = await this.uow.start();
		try {
			// 1. Fetch payment
			const payment = await session.paymentRepository.findById(paymentId);
			if (!payment) throw new PaymentNotFoundException(paymentId);

			// Capture old payment state
			const oldPaymentProps = { ...payment.getProps() };
			if (oldPaymentProps.paymentAttempts) {
				oldPaymentProps.paymentAttempts = [...oldPaymentProps.paymentAttempts];
			}
			const oldPayment = PaymentEntity.instantiate(payment.id, oldPaymentProps);

			// 2. Create attempt using domain retry logic (now via PaymentService)
			const attemptId = this.paymentService.initiateRetry(
				payment,
				paymentProviderId,
				idempotencyKey
			);
			this.logger.log(`Created retry attempt ${attemptId} for payment ${paymentId}`);

			// 3. Save payment (with new attempt)
			await session.paymentRepository.save(payment);

			// Record audit event
			const changes = PaymentEntity.getFieldChanges(oldPayment, payment);
			await session.auditRepository.save(
				PaymentEventEntity.create({
					paymentId: payment.id,
					paymentAttemptId: attemptId,
					eventType: EPaymentEventType.PAYMENT_RETRY,
					triggerType: 'SYSTEM',
					triggeredBy: 'system',
					fieldChanges: changes,
					occurredAt: new Date(),
				})
			);

			// 4. Publish domain events
			await this.eventService.publishEvents(payment, session);

			await session.commit();

			this.logger.log(`Retry attempt ${attemptId} created successfully`);

			return { attemptId };
		} catch (e: unknown) {
			await session.rollback();
			this.logger.error(
				`Failed to create retry attempt for payment ${paymentId}: ${getErrorMessage(e)}`
			);
			throw toError(e);
		} finally {
			await session.end();
		}
	}
}
