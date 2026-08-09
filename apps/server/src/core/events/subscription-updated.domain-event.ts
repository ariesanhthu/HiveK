import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums';
import { type SubscriptionChangeDetailsVO } from '../value-objects';

export interface SubscriptionUpdatedPayload {
  enterpriseId: string;
  subscriptionHistoryId: string;
  details: SubscriptionChangeDetailsVO;
}

export class SubscriptionUpdatedEvent extends DomainEvent<SubscriptionUpdatedPayload> {
  eventType = 'SubscriptionUpdatedEvent';
  aggregateType = EAggregateType.SUBSCRIPTION;

  constructor(
    public readonly enterpriseId: string,
    public readonly subscriptionHistoryId: string,
    public readonly details: SubscriptionChangeDetailsVO,
  ) {
    super(enterpriseId, {
      enterpriseId,
      subscriptionHistoryId,
      details,
    });
  }
}
