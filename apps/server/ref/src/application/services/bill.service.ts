import { Injectable, Inject } from '@nestjs/common';
import { SUBSCRIPTION_REPOSITORY, type ISubscriptionRepository } from '@/core';
import { SubscriptionEntity } from '@/core';
import { SubscriptionItemVO } from '@/core';
import { BillItemVO } from '@/core';
import { EPurchaseType } from '@/core';
import {
	type ResolvedPackageItem,
	PackageLookup,
} from './lookups/package.lookup';
import { type IUnitOfWorkSession } from '@/core/interfaces';
import { PlanChangeResolverService } from './plan-change-resolver.service';
import { EPackageType } from '@/core';

@Injectable()
export class BillService {
	constructor(
		@Inject(SUBSCRIPTION_REPOSITORY)
		private readonly subscriptionRepository: ISubscriptionRepository,
		private readonly planChangeResolverService: PlanChangeResolverService,
		private readonly packageLookup: PackageLookup
	) {}

	/**
	 * Determine purchase types for bill items by comparing with current subscription
	 *
	 * Logic:
	 * - If no enterpriseId provided (preview mode): All packages are NEW
	 * - PLAN: RENEWAL if same versionId + variantId, otherwise NEW
	 * - ADDONS: RENEWAL if same versionId + variantId, otherwise NEW
	 *
	 * @param enterpriseId - Optional Enterprise ID to find subscription. If not provided, treats all as NEW (preview mode)
	 * @param requestedItems - Validated package items from request
	 * @param session - Optional UnitOfWork session for transaction
	 * @returns Array of BillItemVO with determined purchase types
	 */
	async determinePurchaseTypes(
		enterpriseId: string | undefined,
		requestedItems: ResolvedPackageItem[],
		session?: IUnitOfWorkSession
	): Promise<BillItemVO[]> {
		// Get current subscription (if enterpriseId exists)
		const subscription = enterpriseId
			? await this.getCurrentSubscription(enterpriseId, session)
			: null;

		const items: BillItemVO[] = [];

		for (const item of requestedItems) {
			const { pkg: version, variant } = item;

			// Find if this package exists in current subscription
			const existingItem = subscription ? this.findMatchingPackage(item, subscription) : null;

			// Determine purchase type based on comparison
			const purchaseType = this.determinePurchaseType(item, existingItem);

			let creditRefundAmount: number | undefined = undefined;

			// Calculate PLAN change refund if enterpriseId exists and this is a PLAN
			if (enterpriseId && version.type === EPackageType.PLAN) {
				const resolution = await this.planChangeResolverService.resolvePlanChange(
					enterpriseId,
					item,
					session
				);

				if (resolution.isPlanChange && resolution.replacedItem) {
					creditRefundAmount = resolution.replacedItem.refundAmount;
				}
			}

			items.push(
				new BillItemVO({
					packageId: version.id,
					packageVariantId: variant.id,
					price: variant.priceAfterDiscount,
					taxPercent: variant.tax,
					creditRefundAmount,
					purchaseType,
				})
			);
		}

		return items;
	}

	/**
	 * Get current active subscription for enterprise
	 */
	private async getCurrentSubscription(
		enterpriseId: string,
		session?: IUnitOfWorkSession
	): Promise<SubscriptionEntity | null> {
		if (!enterpriseId) return null;
		const repo = session ? session.subscriptionRepository : this.subscriptionRepository;
		return repo.findByEnterpriseId(enterpriseId);
	}

	/**
	 * Find matching package in subscription by comparing version and variant IDs
	 */
	private findMatchingPackage(
		requestedItem: ResolvedPackageItem,
		subscription: SubscriptionEntity
	): SubscriptionItemVO | null {
		return (
			subscription.items.find(
				(item) =>
					item.packageId === requestedItem.pkg.id &&
					item.packageVariantId === requestedItem.variant.id
			) || null
		);
	}

	/**
	 * Determine purchase type based on comparison logic
	 *
	 * Rules:
	 * - If exact match (same versionId + variantId) → RENEWAL
	 * - If no match → NEW
	 */
	private determinePurchaseType(
		requestedItem: ResolvedPackageItem,
		existingItem: SubscriptionItemVO | null
	): EPurchaseType {
		// Exact match → RENEWAL
		if (existingItem !== null) {
			return EPurchaseType.RENEWAL;
		}

		// No match → NEW
		return EPurchaseType.NEW;
	}
}
