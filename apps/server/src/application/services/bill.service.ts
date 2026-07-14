import { Injectable, Inject } from '@nestjs/common';
import { SUBSCRIPTION_REPOSITORY, type ISubscriptionRepository } from '@/core/interfaces/repositories';
import { PACKAGE_REPOSITORY, type IPackageRepository } from '@/core/interfaces/repositories';
import { BillItemVO } from '@/core/value-objects';
import { EPurchaseType, EPackageType, EBillLineType } from '@/core/enums';
import { PackageRoot } from '@/core/aggregate-roots';
import { PackageVariantEntity } from '@/core/entities';

@Injectable()
export class BillService {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject(PACKAGE_REPOSITORY)
    private readonly packageRepository: IPackageRepository,
  ) {}

  /**
   * Determine purchase types for bill items by comparing with current subscription.
   */
  async determinePurchaseTypes(
    enterpriseId: string | undefined,
    requestedItems: { pkg: PackageRoot; variant: PackageVariantEntity }[],
  ): Promise<BillItemVO[]> {
    const subscription = enterpriseId
      ? await this.subscriptionRepository.findByEnterpriseId(enterpriseId)
      : null;

    const items: BillItemVO[] = [];

    for (const item of requestedItems) {
      const { pkg, variant } = item;

      const isPlan = pkg.type === EPackageType.PLAN;
      const lineType = isPlan ? EBillLineType.PLAN_PURCHASE : EBillLineType.ADDON_PURCHASE;

      const existingPlan = subscription?.planItem?.packageVariantId === variant.id;
      const existingAddon = subscription?.addonItems.some(
        (i) => i.packageVariantId === variant.id
      ) || false;

      const existingItem = isPlan ? existingPlan : existingAddon;
      const purchaseType = existingItem ? EPurchaseType.RENEWAL : EPurchaseType.NEW;

      items.push(
        new BillItemVO({
          lineType,
          packageId: pkg.id!,
          packageVariantId: variant.id!,
          creditType: null,
          creditAmount: null,
          price: variant.priceAfterDiscount,
          taxPercent: variant.tax,
          purchaseType,
        })
      );
    }

    return items;
  }
}
