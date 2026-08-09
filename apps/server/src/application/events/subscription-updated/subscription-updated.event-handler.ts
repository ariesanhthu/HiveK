import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { SubscriptionUpdatedEvent } from '@/core/events';
import {
  SUBSCRIPTION_REPOSITORY,
  QUOTA_USAGE_REPOSITORY,
} from '@/core/interfaces/repositories';
import type {
  ISubscriptionRepository,
  IQuotaUsageRepository,
} from '@/core/interfaces/repositories';
import { QuotaUsageRoot } from '@/core/aggregate-roots';
import { EGrantType } from '@/core/enums';
import { ENTITLEMENT_SERVICE } from '@/application/interfaces/entitlement-service.interface';
import type { IEntitlementService } from '@/application/interfaces/entitlement-service.interface';

@EventsHandler(SubscriptionUpdatedEvent)
export class SubscriptionUpdatedEventHandler implements IEventHandler<SubscriptionUpdatedEvent> {
  private readonly logger = new Logger(SubscriptionUpdatedEventHandler.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject(QUOTA_USAGE_REPOSITORY)
    private readonly quotaUsageRepository: IQuotaUsageRepository,
    @Inject(ENTITLEMENT_SERVICE)
    private readonly entitlementService: IEntitlementService,
  ) {}

  async handle(event: SubscriptionUpdatedEvent) {
    const { enterpriseId } = event.payload;
    this.logger.log(
      `Handling SubscriptionUpdatedEvent for enterprise: ${enterpriseId}`,
    );

    const subscription =
      await this.subscriptionRepository.findByUserId(enterpriseId);
    if (!subscription) {
      this.logger.warn(
        `Subscription not found for enterprise: ${enterpriseId}`,
      );
      return;
    }

    let quotaUsage =
      await this.quotaUsageRepository.findByEnterpriseId(enterpriseId);

    // Resolve Anchor Date
    let anchorDate = subscription.createdAt;
    if (subscription.planItem) {
      anchorDate = subscription.planItem.startDate;
    } else if (subscription.addonItems.length > 0) {
      const dates = subscription.addonItems.map((a) => a.purchasedAt.getTime());
      anchorDate = new Date(Math.min(...dates));
    }

    if (!quotaUsage) {
      quotaUsage = QuotaUsageRoot.create(enterpriseId, anchorDate);
    }

    // Filter renewable grants
    const renewableGrants = subscription.computedGrants
      .filter((g) => g.type === EGrantType.QUOTA_RENEWABLE)
      .map((g) => ({
        key: g.key,
        value: g.value,
        resetCycle: g.resetCycle || 'monthly',
      }));

    quotaUsage.recompute(renewableGrants, anchorDate);
    await this.quotaUsageRepository.save(quotaUsage);
    this.logger.log(`Recomputed quota usages for enterprise: ${enterpriseId}`);

    // Invalidate entitlement cache for the owner
    await this.entitlementService.invalidateCache(subscription.userId);
    this.logger.log(
      `Invalidated entitlement cache for owner: ${subscription.userId}`,
    );
  }
}
