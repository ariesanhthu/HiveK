import { EventMetadata, IntegrationEvent, TransportMetadata } from '@/core';

export interface RequestAuthUpdateSubscriptionPayload {
	id: string;
	enterprise_id: string;
	permission: string[];
	quota: Record<string, any>;
	timestamp: string;
}

export class RequestAuthUpdateSubscriptionEvent extends IntegrationEvent<RequestAuthUpdateSubscriptionPayload> {
	public readonly eventType = 'RequestAuthUpdateSubscription';

	constructor(
		payload: RequestAuthUpdateSubscriptionPayload,
		metadata?: EventMetadata,
		transport?: TransportMetadata
	) {
		super(payload, metadata, transport);
	}
}
