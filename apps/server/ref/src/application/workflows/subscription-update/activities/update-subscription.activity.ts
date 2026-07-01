/**
 * Update Subscription Activity
 *
 * Updates subscription by adding new packages from bill.
 * Recalculates aggregated quotas and permissions from all active packages.
 * Uses optimistic locking to handle concurrent updates.
 */

import { Injectable, Inject } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { UPDATE_SUBSCRIPTION_ACTIVITY } from '../subscription-update.token';
import { toError } from '@/shared/utils/error.util';

import {
	type IUnitOfWork,
	UNIT_OF_WORK,
	type ILoggerService,
	LOGGER_SERVICE,
} from '@/core/interfaces';

import { SubscriptionChangeDetailsVO, SubscriptionItemVO, QuotaVO } from '@/core/value-objects';
import { PackageEntity, SubscriptionHistoryEntity } from '@/core/aggregate-roots';
import { PlanChangeResolverService } from '@/application/services';
import { PackageLookup } from '@/application/services/lookups/package.lookup';
import { EPackageType } from '@/core/enums';
import { EVENT_SERVICE, type IEventService } from '@/core/interfaces';

// Input/Output schemas
const UpdateSubscriptionInputSchema = z.object({
	subscriptionId: z.string(),
	billId: z.string(),
});

const UpdateSubscriptionOutputSchema = z.object({
	success: z.boolean(),
	newVersion: z.number(),
});

type UpdateSubscriptionInput = z.infer<typeof UpdateSubscriptionInputSchema>;
type UpdateSubscriptionOutput = z.infer<typeof UpdateSubscriptionOutputSchema>;

@Injectable()
@Activity(UPDATE_SUBSCRIPTION_ACTIVITY)
@ActivityValidation({
	input: UpdateSubscriptionInputSchema,
	output: UpdateSubscriptionOutputSchema,
})
export class UpdateSubscriptionActivity {
	constructor(
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService,
		private readonly planChangeResolverService: PlanChangeResolverService,
		private readonly packageLookup: PackageLookup,
		@Inject(EVENT_SERVICE) private readonly eventService: IEventService
	) {}

	async execute(input: UpdateSubscriptionInput): Promise<UpdateSubscriptionOutput> {
		const { subscriptionId, billId } = input;
		this.logger.log(`Updating subscription: ${subscriptionId} with bill: ${billId}`);

		const maxRetries = 3;
		for (let attempt = 0; attempt < maxRetries; attempt++) {
			const session = await this.uow.start();
			try {
				// 1. Fetch subscription with current version
				const subscription = await session.subscriptionRepository.findById(subscriptionId);
				if (!subscription) {
					throw new Error(`Subscription not found: ${subscriptionId}`);
				}

				const originalVersion = subscription.version;

				const oldPackages = subscription.items.map((item) => item.packageId);
				const oldQuotas = subscription.computedQuotas;
				const oldPermissions = subscription.computedPermissions;

				// 2. Fetch bill to get new packages
				const bill = await session.billRepository.findById(billId);
				if (!bill) {
					throw new Error(`Bill not found: ${billId}`);
				}

				// 3. Calculate expiration date (30 days from now for simplicity)
				const startDate = new Date();
				const expiresAt = new Date();
				expiresAt.setDate(expiresAt.getDate() + 30);

				// 4. Resolve Plan Changes and Add new packages
				const requestedPackageItems = await this.packageLookup.findPackageItems(
					bill.items.map((item) => ({
						packageId: item.packageId,
						packageVariantId: item.packageVariantId,
					})),
					session
				);

				for (const billItem of bill.items) {
					const resolvedItem = requestedPackageItems.find(
						(r) =>
							r.pkg.id === billItem.packageId &&
							r.variant.id === billItem.packageVariantId
					);

					if (resolvedItem?.pkg.type === EPackageType.PLAN) {
						const resolution = await this.planChangeResolverService.resolvePlanChange(
							subscription.enterpriseId,
							resolvedItem,
							session,
							startDate
						);

						if (resolution.isPlanChange && resolution.replacedItem) {
							this.logger.log(
								`Replacing old PLAN package: ${resolution.replacedItem.replacedItem.packageId}`
							);
							subscription.removePackage(
								resolution.replacedItem.replacedItem.packageId
							);
						}
					}

					const subscriptionItem = new SubscriptionItemVO({
						packageId: billItem.packageId,
						packageVariantId: billItem.packageVariantId,
						startDate,
						expiresAt,
						billId,
					});

					subscription.addPackage(subscriptionItem); // Returns false if already exists
				}

				// 5. Fetch all packages to aggregate quotas/permissions
				const packageIds = subscription.items.map((item) => item.packageId);
				const packages = await session.packageRepository.findByIds(packageIds);

				if (packages.length !== packageIds.length) {
					throw new Error('Some packages not found');
				}

				// 6. Aggregate quotas and permissions
				const aggregatedQuotas = this.aggregateQuotas(packages);
				const aggregatedPermissions = this.aggregatePermissions(packages);

				// 7. Update computed fields
				subscription.updateComputedFields(aggregatedQuotas, aggregatedPermissions);

				// 8. Save with optimistic locking
				await session.subscriptionRepository.updateWithVersion(
					subscriptionId,
					originalVersion,
					subscription
				);

				const subscriptionHistory = SubscriptionHistoryEntity.create({
					subscriptionId,
					enterpriseId: subscription.enterpriseId,
					billId: billId,
					actorId: undefined,
					details: new SubscriptionChangeDetailsVO({
						oldPackages: oldPackages,
						newPackages: subscription.items.map((item) => item.packageId),
						oldQuotas: oldQuotas,
						newQuotas: subscription.computedQuotas,
						oldPermissions: oldPermissions,
						newPermissions: subscription.computedPermissions,
					}),
					createdAt: new Date(),
				});

				await session.subscriptionHistoryRepository.create(subscriptionHistory);

				subscription.recordSubscriptionUpdated(
					subscriptionHistory.id,
					subscriptionHistory.details
				);

				await this.eventService.publishEvents(subscription, session);

				await session.commit();

				this.logger.log(
					`Successfully updated subscription ${subscriptionId}. New version: ${subscription.version}`
				);

				return {
					success: true,
					newVersion: subscription.version,
				};
			} catch (error: unknown) {
				await session.rollback();

				// Retry on version conflict
				const message = error instanceof Error ? error.message : String(error);
				if (message.includes('Version conflict') && attempt < maxRetries - 1) {
					this.logger.warn(
						`Version conflict detected. Retrying... (${attempt + 1}/${maxRetries})`
					);
					await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
					continue;
				}

				throw toError(error);
			} finally {
				await session.end();
			}
		}

		throw new Error('Failed to update subscription after maximum retries');
	}

	private aggregateQuotas(packages: PackageEntity[]): QuotaVO {
		// Aggregate quotas from all packages
		// Sum all quota values (maxUsers, storageGb, etc.)
		const aggregated: Record<string, number> = {};

		for (const pkg of packages) {
			const baseQuotas = pkg.baseQuotas.unmarshal;

			for (const [key, value] of Object.entries(baseQuotas)) {
				if (typeof value === 'number' && value !== null) {
					aggregated[key] = (aggregated[key] || 0) + value;
				}
			}

			// Also add quotas from variants if any
			for (const variant of pkg.variants || []) {
				if (variant.extraQuotas) {
					const extraQuotas = variant.extraQuotas.unmarshal;
					for (const [key, value] of Object.entries(extraQuotas)) {
						if (typeof value === 'number' && value !== null) {
							aggregated[key] = (aggregated[key] || 0) + value;
						}
					}
				}
			}
		}

		return new QuotaVO(aggregated);
	}

	private aggregatePermissions(packages: PackageEntity[]): string[] {
		// Aggregate permissions from all packages (unique)
		const permissionsSet = new Set<string>();

		for (const pkg of packages) {
			for (const feature of pkg.features) {
				for (const permission of feature.permissions) {
					permissionsSet.add(permission);
				}
			}
		}

		return Array.from(permissionsSet);
	}
}
