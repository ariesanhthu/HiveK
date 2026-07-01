/**
 * Create Payment Entry Activity
 *
 * Creates a new payment record with first attempt in the database.
 * Calls payment.retry() to initialize the first payment attempt.
 */

import { PaymentService } from '@/application/services/payment.service';
import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { CREATE_PAYMENT_ENTRY_ACTIVITY } from '../payment-create.token';
import { EVENT_SERVICE, type IEventService } from '@/core';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { PaymentEntity } from '@/core';
import { MoneyVO } from '@/core';
import { EPaymentStatus } from '@/core';
import { EPaymentEventType, PaymentEventEntity, TriggerType } from '@/core';
import { ECurrency } from '@/core';
import { PaymentException } from '@/core';
import { getErrorMessage, toError } from '@/shared/utils/error.util';

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

// Input/Output schemas
const CreatePaymentEntryInputSchema = z.object({
	idempotencyKey: z.string(),
	enterpriseId: z.string(),
	userId: z.string().nullable(),
	billId: z.string(),
	amount: z.number().positive(),
	currency: z.string(),
	description: z.string(),
	metadata: z.record(z.string(), z.unknown()),
	createdBy: z.string(),
	paymentProviderId: z.string(),
});

const CreatePaymentEntryOutputSchema = z.object({
	paymentId: z.string(),
	attemptId: z.string(),
});

export type CreatePaymentEntryInput = z.infer<typeof CreatePaymentEntryInputSchema>;
export type CreatePaymentEntryOutput = z.infer<typeof CreatePaymentEntryOutputSchema>;

@Injectable()
@Activity(CREATE_PAYMENT_ENTRY_ACTIVITY)
@ActivityValidation({
	input: CreatePaymentEntryInputSchema,
	output: CreatePaymentEntryOutputSchema,
})
export class CreatePaymentEntryActivity {
	constructor(
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService,
		@Inject(EVENT_SERVICE) private readonly eventService: IEventService,
		private readonly paymentService: PaymentService
	) {}

	async execute(input: CreatePaymentEntryInput): Promise<CreatePaymentEntryOutput> {
		const {
			idempotencyKey,
			enterpriseId,
			userId,
			billId,
			amount,
			currency,
			description,
			metadata,
			createdBy,
			paymentProviderId,
		} = input;

		this.logger.log(`Creating payment for bill ${billId} with provider ${paymentProviderId}`);
		// 1. Create Payment Entity
		const payment = PaymentEntity.create({
			enterpriseId,
			userId,
			billId,
			amount: new MoneyVO(amount, currency as ECurrency),
			description,
			idempotencyKey,
			metadata,
		});

		// 2. Create first attempt using domain logic via PaymentService
		this.paymentService.initiateRetry(payment, paymentProviderId, idempotencyKey);

		const session = await this.uow.start();
		try {
			// 3. Save payment (with attempt)
			const savedPayment = await session.paymentRepository.create(payment);
			const attemptId = savedPayment.getLatestAttempt()?.id;
			if (!attemptId) {
				throw new PaymentException('Failed to create first payment attempt');
			}

			this.logger.log(`Created first attempt ${attemptId} for payment`);
			// 4. Audit - Payment Created
			const triggerType = getTriggerType(createdBy);
			const fieldChanges = {
				status: { old: undefined, new: EPaymentStatus.PENDING },
				amount: {
					old: undefined,
					new: {
						amount: savedPayment.amount.amount,
						currency: savedPayment.amount.currency,
					},
				},
				enterpriseId: { old: undefined, new: savedPayment.enterpriseId },
				billId: { old: undefined, new: savedPayment.billId },
			};
			await session.auditRepository.create(
				PaymentEventEntity.create({
					paymentId: savedPayment.id,
					paymentAttemptId: null,
					eventType: EPaymentEventType.PAYMENT_CREATED,
					triggerType,
					triggeredBy: createdBy,
					fieldChanges,
					occurredAt: new Date(),
				})
			);

			// 5. Publish domain events
			await this.eventService.publishEvents(payment, session);
			await session.commit();

			this.logger.log(
				`Payment ${savedPayment.id} created successfully with attempt ${attemptId}`
			);

			return {
				paymentId: savedPayment.id,
				attemptId,
			};
		} catch (e: unknown) {
			await session.rollback();
			this.logger.error(`Failed to create payment for bill ${billId}: ${getErrorMessage(e)}`);
			throw toError(e);
		} finally {
			await session.end();
		}
	}
}
