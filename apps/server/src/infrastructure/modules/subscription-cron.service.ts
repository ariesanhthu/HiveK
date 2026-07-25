import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  SUBSCRIPTION_REPOSITORY,
  SUBSCRIPTION_HISTORY_REPOSITORY,
  QUOTA_USAGE_REPOSITORY,
  PACKAGE_REPOSITORY,
} from '@/core/interfaces/repositories';
import type {
  ISubscriptionRepository,
  ISubscriptionHistoryRepository,
  IQuotaUsageRepository,
  IPackageRepository,
} from '@/core/interfaces/repositories';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { SubscriptionHistoryEntity, PackageRoot } from '@/core/aggregate-roots';
import { SubscriptionChangeDetailsVO, GrantVO } from '@/core/value-objects';

@Injectable()
export class SubscriptionCronService {
  private readonly logger = new Logger(SubscriptionCronService.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject(SUBSCRIPTION_HISTORY_REPOSITORY)
    private readonly historyRepository: ISubscriptionHistoryRepository,
    @Inject(QUOTA_USAGE_REPOSITORY)
    private readonly quotaUsageRepository: IQuotaUsageRepository,
    @Inject(PACKAGE_REPOSITORY)
    private readonly packageRepository: IPackageRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  @Cron('0 0 * * *') // Daily at midnight UTC
  async resetExpiredCyclesCron() {
    this.logger.log('Running resetExpiredCyclesCron...');
    const now = new Date();
    await this.uow.execute(async () => {
      const expiredUsages = await this.quotaUsageRepository.findExpiredUsages(now);
      for (const usage of expiredUsages) {
        const resetKeys = usage.resetExpiredCycles(now);
        if (resetKeys.length > 0) {
          await this.quotaUsageRepository.save(usage);
          this.logger.log(`Reset expired cycles for enterprise ${usage.enterpriseId}: keys [${resetKeys.join(', ')}]`);
        }
      }
    });
  }

  @Cron('0 1 * * *') // Daily at 1 AM UTC
  async checkSubscriptionExpiryCron() {
    this.logger.log('Running checkSubscriptionExpiryCron...');
    const now = new Date();
    await this.uow.execute(async () => {
      const expiredSubs = await this.subscriptionRepository.findExpiredSubscriptions(now);
      for (const sub of expiredSubs) {
        if (sub.planItem && !sub.planItem.autoRenew) {
          const originalVersion = sub.version;
          const oldPlanId = sub.planItem.packageId;
          const oldGrants = sub.computedGrants;
          const oldPermissions = sub.computedPermissions;

          sub.expirePlan();

          const addonPackageIds = sub.addonItems.map((a) => a.packageId);
          const addonPackages = (await Promise.all(
            addonPackageIds.map((id) => this.packageRepository.findById(id))
          )).filter((p): p is PackageRoot => p !== null);
          const addonPackageMap = new Map(addonPackages.map((p) => [p.id, p]));

          const addonsGrantsMap = new Map<string, GrantVO[]>();
          for (const addon of sub.addonItems) {
            const addonPkg = addonPackageMap.get(addon.packageId);
            if (addonPkg) {
              const addonVariant = addonPkg.variants.find((v) => v.id === addon.packageVariantId);
              if (addonVariant) {
                const grants = [...addonPkg.baseGrants, ...addonVariant.extraGrants];
                addonsGrantsMap.set(addon.packageVariantId, grants);
              }
            }
          }

          sub.recomputeGrants([], addonsGrantsMap);
          sub.updateComputedFields(sub.computedGrants, sub.computedPermissions);

          await this.subscriptionRepository.updateWithVersion(sub.id!, originalVersion, sub);

          const history = SubscriptionHistoryEntity.create({
            subscriptionId: sub.id!,
            userId: sub.userId,
            billId: undefined,
            actorId: undefined,
            details: new SubscriptionChangeDetailsVO({
              oldPlanId,
              newPlanId: null,
              addedAddonIds: [],
              removedAddonIds: [],
              oldGrants,
              newGrants: sub.computedGrants,
              oldPermissions,
              newPermissions: sub.computedPermissions,
            }),
            createdAt: now,
          });

          await this.historyRepository.save(history);
          sub.recordSubscriptionUpdated(history.id!, history.details);

          this.logger.log(`Subscription plan expired for enterprise ${sub.userId}, plan ${oldPlanId}`);
        }
      }
    });
  }
}
