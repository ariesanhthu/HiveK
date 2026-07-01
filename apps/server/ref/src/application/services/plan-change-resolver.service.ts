import { Injectable } from '@nestjs/common';
import { PackageLookup, type ResolvedPackageItem } from './lookups/package.lookup';
import { SubscriptionLookup } from './lookups/subscription.lookup';
import { BillLookup } from './lookups/bill.lookup';
import { type IUnitOfWorkSession } from '@/core/interfaces';
import { type SubscriptionItemVO } from '@/core';
import { EPackageType } from '@/core';
import { type Nullable } from '@/core';

export interface PlanChangeResult {
	replacedItem: SubscriptionItemVO;
	newItem: ResolvedPackageItem;
	refundAmount: number;
	remainingDays: number;
	totalDays: number;
}

export interface PlanChangeResolution {
	/**
	 * True if there is an active PLAN being replaced.
	 * False if it is a NEW plan purchase or a direct RENEWAL.
	 */
	isPlanChange: boolean;
	replacedItem: Nullable<PlanChangeResult>;
}

@Injectable()
export class PlanChangeResolverService {
	constructor(
		private readonly subscriptionLookup: SubscriptionLookup,
		private readonly packageLookup: PackageLookup,
		private readonly billLookup: BillLookup
	) {}

	/**
	 * Resolves a plan change by analyzing the requested PLAN against the current subscription.
	 *
	 * Constraints:
	 * - Only 1 PLAN parameter allowed as input (enforced by ResolvedPackageItem type).
	 * - Uses billId from SubscriptionItemVO to lookup the historical amount paid for the old PLAN.
	 *
	 * @param enterpriseId The ID of the enterprise to lookup subscription for
	 * @param requestedPlanItem The new requested PLAN package
	 * @param session Optional database transaction session
	 * @param referenceDate Date to calculate remaining refund from (defaults to now)
	 * @returns PlanChangeResolution detailing if a replacement occurred and the refund amount
	 */
	async resolvePlanChange(
		enterpriseId: string,
		requestedPlanItem: ResolvedPackageItem,
		session?: IUnitOfWorkSession,
		referenceDate: Date = new Date()
	): Promise<PlanChangeResolution> {
		const subscription = await this.subscriptionLookup.findSubscriptionByEnterpriseId(
			enterpriseId,
			session
		);

		// If no subscription at all, this is a completely NEW plan
		if (!subscription) {
			return { isPlanChange: false, replacedItem: null };
		}

		// 1. Find all active subscription items
		const activeItems = subscription.items.filter((item) => item.expiresAt >= referenceDate);
		if (!activeItems.length) {
			return { isPlanChange: false, replacedItem: null };
		}

		// 2. Identify which of the active items is a PLAN
		// First fetch packages + variants (this now includes all metadata)
		const resolvedActiveItems = await this.packageLookup.findPackageItems(
			activeItems.map((i) => ({
				packageId: i.packageId,
				packageVariantId: i.packageVariantId,
			})),
			session
		);

		// Match up and find the active PLAN
		let activePlanItem: SubscriptionItemVO | null = null;

		for (const item of activeItems) {
			const resolved = resolvedActiveItems.find(
				(r) => r.pkg.id === item.packageId && r.variant.id === item.packageVariantId
			);
			if (!resolved) continue;

			// Directly check type on the package
			if (resolved.pkg.type === EPackageType.PLAN) {
				activePlanItem = item;
				break; // Enterprise can strictly only have 1 active PLAN
			}
		}

		// If they don't have an active PLAN currently, this is a NEW plan purchase
		if (!activePlanItem) {
			return { isPlanChange: false, replacedItem: null };
		}

		// 3. Determine if it's a RENEWAL
		if (
			activePlanItem.packageId === requestedPlanItem.pkg.id &&
			activePlanItem.packageVariantId === requestedPlanItem.variant.id
		) {
			// They are buying the exact same plan — not a change, just extending
			return { isPlanChange: false, replacedItem: null };
		}

		// 4. It's a PLAN CHANGE (Replacement). Calculate Refund.
		let pricePaid = 0;

		// Fetch the historical bill to look up how much they actually paid
		if (activePlanItem.billId) {
			const historicalBill = await this.billLookup.findBill(activePlanItem.billId, session);
			if (historicalBill) {
				const billItem = historicalBill.items.find(
					(i) =>
						i.packageId === activePlanItem.packageId &&
						i.packageVariantId === activePlanItem.packageVariantId
				);
				if (billItem) {
					pricePaid = billItem.price; // Getting the specific paid price
				}
			}
		}

		// 5. Calculate remaining days and refund amount
		const { remainingDays, totalDays } = this.calculateDays(
			activePlanItem.startDate,
			activePlanItem.expiresAt,
			referenceDate
		);

		const refundAmount = this.calculateProRataRefund(pricePaid, remainingDays, totalDays);

		return {
			isPlanChange: true,
			replacedItem: {
				replacedItem: activePlanItem,
				newItem: requestedPlanItem,
				refundAmount,
				remainingDays,
				totalDays,
			},
		};
	}

	private calculateDays(
		startDate: Date,
		expiresAt: Date,
		referenceDate: Date
	): { remainingDays: number; totalDays: number } {
		const msPerDay = 1000 * 60 * 60 * 24;

		// Total duration originally purchased
		const totalDays = Math.max(
			1,
			Math.ceil((expiresAt.getTime() - startDate.getTime()) / msPerDay)
		);

		// Number of days left from today until expiration
		const remainingDays = Math.max(
			0,
			Math.ceil((expiresAt.getTime() - referenceDate.getTime()) / msPerDay)
		);

		return { remainingDays, totalDays };
	}

	private calculateProRataRefund(
		_pricePaid: number,
		_remainingDays: number,
		_totalDays: number
	): number {
		// Wallet feature is disabled, return 0 refund amount
		return 0;
		/*
		if (totalDays <= 0 || remainingDays <= 0 || pricePaid <= 0) {
			return 0;
		}

		const refund = pricePaid * (remainingDays / totalDays);
		// Round to 2 decimal places properly
		return Math.round(refund * 100) / 100;
		*/
	}
}
