import { DomainEvent, IntegrationEvent } from '@/core';
import {
	BillCancelledEvent,
	BillCreatedEvent,
	BillPaidEvent,
	PaymentAttemptStartedEvent,
	PaymentAuthorizedEvent,
	PaymentCreatedEvent,
	PaymentFailedEvent,
	PaymentCompletedEvent,
	PaymentRefundedEvent,
	TransactionRecordedEvent,
	SubscriptionUpdatedEvent,
	PaymentCancelAttemptedEvent,
} from '@/core/events';
import { CapturePaymentRequestEvent, UpdateSubscriptionEvent, RequestAuthUpdateSubscriptionEvent } from '../events';

export class EventMapper {
	/**
	 * Maps a single DomainEvent to a corresponding IntegrationEvent.
	 */
	public static mapToIntegrationEvent(event: DomainEvent): IntegrationEvent[] {
		switch (true) {
			case event instanceof BillCancelledEvent:
				return [];
			case event instanceof BillCreatedEvent:
				return [];
			case event instanceof BillPaidEvent:
				return [];
			case event instanceof PaymentAttemptStartedEvent:
				return [];
			case event instanceof PaymentAuthorizedEvent:
				return [new CapturePaymentRequestEvent((event as PaymentAuthorizedEvent).payload)];
			case event instanceof PaymentCancelAttemptedEvent:
				return [];
			case event instanceof PaymentCompletedEvent:
				return [new UpdateSubscriptionEvent((event as PaymentCompletedEvent).payload)];
			case event instanceof PaymentCreatedEvent:
				return [];
			case event instanceof PaymentFailedEvent:
				return [];
			case event instanceof PaymentRefundedEvent:
				return [];
			case event instanceof TransactionRecordedEvent:
				return [];
			case event instanceof SubscriptionUpdatedEvent: {
				const e = event as SubscriptionUpdatedEvent;
				return [
					new RequestAuthUpdateSubscriptionEvent(
						{
							id: e.payload.subscriptionHistoryId,
							enterprise_id: e.payload.enterpriseId,
							permission: e.payload.details.newPermissions,
							quota: e.payload.details.newQuotas.unmarshal,
							timestamp: new Date().toISOString(),
						},
						undefined,
						{
							topic: 'payment.subscription.auth.updated',
							key: e.payload.subscriptionHistoryId,
						}
					),
				];
			}
			default:
				return [];
		}
	}

	/**
	 * Maps a list of DomainEvents to IntegrationEvents.
	 */
	public static mapToIntegrationEvents(events: DomainEvent[]): IntegrationEvent[] {
		return events.flatMap((event) => EventMapper.mapToIntegrationEvent(event));
	}
}
