/**
 * Cancel Payment Activity
 *
 * Cancels a pending payment by updating state and publishing events.
 * Events are published inside the transaction to ensure atomicity.
 */

import { PaymentService } from '@/application/services/payment.service';
import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { CANCEL_PAYMENT_ACTIVITY } from '../payment-cancel.token';
import { EVENT_SERVICE, type IEventService } from '@/core';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import {
	PaymentNotFoundException,
	PaymentEntity,
	PaymentEventEntity,
	EPaymentEventType,
	TriggerType,
} from '@/core';
import { toError } from '@/shared/utils/error.util';

// Input/Output schemas
const CancelPaymentInputSchema = z.object({
	paymentId: z.string(),
	reason: z.string(),
	canceledBy: z.string(),
});

const CancelPaymentOutputSchema = z.object({
	success: z.boolean(),
});

type CancelPaymentInput = z.infer<typeof CancelPaymentInputSchema>;
type CancelPaymentOutput = z.infer<typeof CancelPaymentOutputSchema>;

function getTriggerType(triggeredBy: string): TriggerType {
	const byLower = triggeredBy.toLowerCase();
	if (byLower === 'system' || byLower === 'cron' || byLower === 'provider') {
		return 'SYSTEM';
	}
	if (byLower === 'admin' || byLower.includes('admin')) {
		return 'ADMIN';
	}
	return 'USER';
}

@Injectable()
@Activity(CANCEL_PAYMENT_ACTIVITY)
@ActivityValidation({
	input: CancelPaymentInputSchema,
	output: CancelPaymentOutputSchema,
})
export class CancelPaymentActivity {
	constructor(
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService,
		@Inject(EVENT_SERVICE) private readonly eventService: IEventService,
		private readonly paymentService: PaymentService
	) {}

	async execute(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
		const { paymentId, reason, canceledBy } = input;
		this.logger.log(`Cancelling payment ${paymentId}`);

		const session = await this.uow.start();
		try {
			const payment = await session.paymentRepository.findById(paymentId);
			if (!payment) throw new PaymentNotFoundException(paymentId);

			// Capture old payment state
			const oldPaymentProps = { ...payment.getProps() };
			if (oldPaymentProps.paymentAttempts) {
				oldPaymentProps.paymentAttempts = [...oldPaymentProps.paymentAttempts];
			}
			const oldPayment = PaymentEntity.instantiate(payment.id, oldPaymentProps);

			this.paymentService.cancelPayment(payment, reason, canceledBy);

			await session.paymentRepository.save(payment);

			// Record audit event
			const changes = PaymentEntity.getFieldChanges(oldPayment, payment);
			await session.auditRepository.save(
				PaymentEventEntity.create({
					paymentId: payment.id,
					paymentAttemptId: payment.getLatestAttempt()?.id || null,
					eventType: EPaymentEventType.PAYMENT_CANCELED,
					triggerType: getTriggerType(canceledBy),
					triggeredBy: canceledBy,
					fieldChanges: changes,
					occurredAt: new Date(),
				})
			);

			// Publish events BEFORE commit to ensure atomicity
			await this.eventService.publishEvents(payment, session);
			await session.commit();

			this.logger.log(`Successfully canceled payment ${paymentId}`);

			return {
				success: true,
			};
		} catch (e) {
			await session.rollback();
			throw toError(e);
		} finally {
			await session.end();
		}
	}
}
