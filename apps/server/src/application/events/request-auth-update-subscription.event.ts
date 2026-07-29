import {
  IntegrationEvent,
  EventMetadata,
  TransportMetadata,
} from '@/core/common';

export interface RequestAuthUpdateSubscriptionPayload {
  id: string;
  enterprise_id: string;
  permission: string[];
  quota: Record<string, number>;
  timestamp: string;
}

export class RequestAuthUpdateSubscriptionEvent extends IntegrationEvent<RequestAuthUpdateSubscriptionPayload> {
  public readonly eventType = 'RequestAuthUpdateSubscription';

  constructor(
    payload: RequestAuthUpdateSubscriptionPayload,
    metadata?: EventMetadata,
    transport?: TransportMetadata,
  ) {
    super(payload, metadata, transport);
  }
}
