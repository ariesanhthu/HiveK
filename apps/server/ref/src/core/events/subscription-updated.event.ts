import { DomainEvent } from '../abstract/base.event';
import { EAggregateType } from '../enums';
import { type SubscriptionChangeDetailsVO } from '../value-objects';

export class SubscriptionUpdatedEvent extends DomainEvent<{
	enterpriseId: string;
	subscriptionHistoryId: string;
	details: SubscriptionChangeDetailsVO;
}> {
	eventType = 'SubscriptionUpdatedEvent';
	aggregateType = EAggregateType.SUBSCRIPTION;

	constructor(
		public readonly enterpriseId: string,
		public readonly subscriptionHistoryId: string,
		public readonly details: SubscriptionChangeDetailsVO
	) {
		super(enterpriseId, {
			enterpriseId,
			subscriptionHistoryId,
			details,
		});
	}
}
