import { Injectable, Inject } from '@nestjs/common';
import { SUBSCRIPTION_REPOSITORY, type ISubscriptionRepository } from '@/core/interfaces/repositories';
import { PACKAGE_REPOSITORY, type IPackageRepository } from '@/core/interfaces/repositories';
import { BillItemVO } from '@/core/value-objects';
import { EPurchaseType } from '@/core/enums';
import { PackageEntity } from '@/core/aggregate-roots';
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
    requestedItems: { pkg: PackageEntity; variant: PackageVariantEntity }[],
  ): Promise<BillItemVO[]> {
    const subscription = enterpriseId
      ? await this.subscriptionRepository.findByEnterpriseId(enterpriseId)
      : null;

    const items: BillItemVO[] = [];

    for (const item of requestedItems) {
      const { pkg, variant } = item;

      // Find if this variant exists in current subscription
      const existingItem = subscription
        ? subscription.items.find(
            (i) => i.packageId === pkg.id && i.packageVariantId === variant.id
          ) || null
        : null;

      const purchaseType = existingItem ? EPurchaseType.RENEWAL : EPurchaseType.NEW;

      items.push(
        new BillItemVO({
          packageId: pkg.id!,
          packageVariantId: variant.id!,
          price: variant.priceAfterDiscount,
          taxPercent: variant.tax,
          purchaseType,
        })
      );
    }

    return items;
  }
}
