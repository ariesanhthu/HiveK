/**
 * Validate Update Activity
 *
 * Pre-flight validation for subscription update workflow.
 * Checks bill and subscription exist, verifies bill is paid,
 * and calculates credit operations needed.
 */

import { Injectable, Inject } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { VALIDATE_UPDATE_ACTIVITY } from '../subscription-update.token';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { EBillStatus } from '@/core';
import { SubscriptionEntity } from '@/core';
import { ESubscriptionStatus } from '@/core';
import { QuotaVO } from '@/core';

// Input/Output schemas
const ValidateUpdateInputSchema = z.object({
	billId: z.string(),
});

const ValidateUpdateOutputSchema = z.object({
	subscriptionId: z.string(),
	canUpdate: z.boolean(),
	enterpriseId: z.string(),
	creditToDeduct: z.number(),
	currency: z.string(),
});

type ValidateUpdateInput = z.infer<typeof ValidateUpdateInputSchema>;
type ValidateUpdateOutput = z.infer<typeof ValidateUpdateOutputSchema>;

@Injectable()
@Activity(VALIDATE_UPDATE_ACTIVITY)
@ActivityValidation({
	input: ValidateUpdateInputSchema,
	output: ValidateUpdateOutputSchema,
})
export class ValidateUpdateActivity {
	constructor(
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService
	) {}

	async execute(input: ValidateUpdateInput): Promise<ValidateUpdateOutput> {
		const { billId } = input;
		this.logger.log(`Validating subscription update for bill: ${billId}`);

		const session = await this.uow.start();
		try {
			// 1. Fetch bill
			const bill = await session.billRepository.findById(billId);
			if (!bill) {
				throw new Error(`Bill not found: ${billId}`);
			}

			// 2. Verify bill is paid
			if (bill.status !== EBillStatus.DONE) {
				throw new Error(`Bill ${billId} is not paid. Current status: ${bill.status}`);
			}

			// 3. Fetch or initialize subscription
			let subscription = await session.subscriptionRepository.findByEnterpriseId(
				bill.enterpriseId
			);
			let id = subscription?.id;
			if (!subscription) {
				this.logger.log(
					`Subscription not found for enterprise: ${bill.enterpriseId}, initializing new subscription`
				);
				// Initialize new subscription for new enterprise
				subscription = SubscriptionEntity.create({
					enterpriseId: bill.enterpriseId,
					status: ESubscriptionStatus.ACTIVE,
					items: [],
					computedQuotas: new QuotaVO({
						maxUsers: 0,
						storageGb: 0,
					}),
					computedPermissions: [],
					version: 1,
					nextExpiryCheckAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
				});
				const savedSubscription = await session.subscriptionRepository.create(subscription);
				id = savedSubscription.id;
				this.logger.log(
					`Subscription initialized with ID: ${savedSubscription.id} for enterprise: ${bill.enterpriseId}`
				);
				this.logger.log(
					`Subscription ${savedSubscription.id} details: ${JSON.stringify(savedSubscription)}`
				);
			}

			// 4. Calculate credit to deduct (from bill)
			const creditToDeduct = bill.creditAmountApplied;

			this.logger.log(`Validation successful. Credit to deduct: ${creditToDeduct}`);

			await session.commit();
			return {
				subscriptionId: id!,
				canUpdate: true,
				enterpriseId: subscription.enterpriseId,
				creditToDeduct,
				currency: bill.currency,
			};
		} finally {
			await session.end();
		}
	}
}
