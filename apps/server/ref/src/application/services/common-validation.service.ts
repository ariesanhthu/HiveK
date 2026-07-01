import { Injectable } from '@nestjs/common';
import { PackageLookup, ResolvedPackageItem } from './lookups/package.lookup';
import { BillLookup } from './lookups/bill.lookup';
import { SubscriptionLookup } from './lookups/subscription.lookup';
import { PackageEntity } from '@/core';
import { BillEntity } from '@/core';
import { SubscriptionEntity } from '@/core';
import { IUnitOfWorkSession } from '@/core/interfaces';

/**
 * Facade service that composes all domain lookup services.
 *
 * @deprecated Use individual lookup services (PackageLookup, BillLookup, etc.) directly for new code.
 * This service is kept for backward compatibility.
 */
@Injectable()
export class CommonValidationService {
	constructor(
		private readonly packageLookup: PackageLookup,
		private readonly billLookup: BillLookup,
		private readonly subscriptionLookup: SubscriptionLookup
	) {}

	// --- Package Lookups (delegated) ---

	async validatePackageExists(
		id: string,
		session?: IUnitOfWorkSession
	): Promise<PackageEntity | null> {
		return this.packageLookup.findPackage(id, session);
	}

	async validatePackagesExist(
		ids: string[],
		session?: IUnitOfWorkSession
	): Promise<PackageEntity[]> {
		return this.packageLookup.findPackages(ids, session);
	}

	async validatePackageActive(
		id: string,
		session?: IUnitOfWorkSession
	): Promise<PackageEntity | null> {
		return this.packageLookup.findActivePackage(id, session);
	}

	async validatePackageItems(
		items: { packageId: string; packageVariantId: string }[],
		session?: IUnitOfWorkSession
	): Promise<ResolvedPackageItem[]> {
		return this.packageLookup.findPackageItems(items, session);
	}

	// --- Bill Lookups (delegated) ---

	async validateBillExists(id: string, session?: IUnitOfWorkSession): Promise<BillEntity | null> {
		return this.billLookup.findBill(id, session);
	}

	// --- Subscription Lookups (delegated) ---

	async validateSubscriptionExists(
		id: string,
		session?: IUnitOfWorkSession
	): Promise<SubscriptionEntity | null> {
		return this.subscriptionLookup.findSubscription(id, session);
	}
}

// Re-export for backward compatibility
export type { ResolvedPackageItem as ValidatedBillItem } from './lookups/package.lookup';
