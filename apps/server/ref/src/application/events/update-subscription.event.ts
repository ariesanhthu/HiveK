import { EventMetadata, IntegrationEvent, TransportMetadata } from '@/core';

export interface UpdateSubscriptionPayload {
	paymentId: string;
	billId: string;
	attemptId: string;
	amount: number;
	currency: string;
}

export class UpdateSubscriptionEvent extends IntegrationEvent<UpdateSubscriptionPayload> {
	public readonly eventType = 'UpdateSubscription';

	constructor(
		payload: UpdateSubscriptionPayload,
		metadata?: EventMetadata,
		transport?: TransportMetadata
	) {
		super(payload, metadata, transport);
	}
}
