/**
 * Cancel Attempt Activity
 *
 * Cancels a payment attempt when provider request fails.
 * This is a reusable compensation activity for SAGA pattern.
 *
 * Use Cases:
 * - Compensation when request-payment-url fails
 * - Compensation when other provider operations fail
 * - Manual attempt cancellation
 */

import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { CANCEL_ATTEMPT_ACTIVITY } from '../payment-create.token';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { PaymentNotFoundException, PaymentAttemptEntity } from '@/core';
import { EPaymentEventType, PaymentEventEntity } from '@/core';

import { getErrorMessage, toError } from '@/shared/utils/error.util';

// Input/Output schemas
const CancelAttemptInputSchema = z.object({
	paymentId: z.string(),
	attemptId: z.string(),
	reason: z.string().optional(),
});

const CancelAttemptOutputSchema = z.object({
	cancelled: z.boolean(),
});

export type CancelAttemptInput = z.infer<typeof CancelAttemptInputSchema>;
export type CancelAttemptOutput = z.infer<typeof CancelAttemptOutputSchema>;

@Injectable()
@Activity(CANCEL_ATTEMPT_ACTIVITY)
@ActivityValidation({
	input: CancelAttemptInputSchema,
	output: CancelAttemptOutputSchema,
})
export class CancelAttemptActivity {
	constructor(
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService
	) {}

	async execute(input: CancelAttemptInput): Promise<CancelAttemptOutput> {
		const { paymentId, attemptId, reason } = input;
		this.logger.log(`Cancelling attempt ${attemptId} for payment ${paymentId}`);

		const session = await this.uow.start();
		try {
			// 1. Fetch payment
			const payment = await session.paymentRepository.findById(paymentId);
			if (!payment) throw new PaymentNotFoundException(paymentId);

			// 2. Get attempt
			const attempt = payment.getAttemptById(attemptId);
			if (!attempt) {
				this.logger.warn(`Attempt ${attemptId} not found, skipping cancellation`);
				return { cancelled: false };
			}

			// 3. Cancel attempt using domain method
			const oldAttemptProps = { ...attempt.getProps() };
			if (oldAttemptProps.transactions) {
				oldAttemptProps.transactions = [...oldAttemptProps.transactions];
			}
			const oldAttempt = PaymentAttemptEntity.instantiate(attempt.id, oldAttemptProps);

			const oldStatus = attempt.status.value;
			attempt.cancel();
			this.logger.log(`Attempt ${attemptId} cancelled from status ${oldStatus}`);

			// 4. Save payment
			await session.paymentRepository.save(payment);

			// 5. Record audit event
			const changes = PaymentAttemptEntity.getFieldChanges(oldAttempt, attempt);
			await session.auditRepository.save(
				PaymentEventEntity.create({
					paymentId: payment.id,
					paymentAttemptId: attemptId,
					eventType: EPaymentEventType.ATTEMPT_CANCELED,
					triggerType: 'SYSTEM',
					triggeredBy: 'system',
					fieldChanges: changes,
					occurredAt: new Date(),
				})
			);

			await session.commit();

			this.logger.log(
				`Attempt ${attemptId} successfully cancelled. Reason: ${reason || 'N/A'}`
			);

			return { cancelled: true };
		} catch (e: unknown) {
			await session.rollback();
			this.logger.error(`Failed to cancel attempt ${attemptId}: ${getErrorMessage(e)}`);
			throw toError(e);
		} finally {
			await session.end();
		}
	}
}
