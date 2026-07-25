import { IntegrationEvent, EventMetadata, TransportMetadata } from '@/core/common';

export interface PostScheduledIntegrationPayload {
  postId: string;
  enterpriseId: string;
  socialPageId: string;
  scheduledAt: string;
}

export class PostScheduledIntegrationEvent extends IntegrationEvent<PostScheduledIntegrationPayload> {
  public readonly eventType = 'PostScheduled';

  constructor(
    payload: PostScheduledIntegrationPayload,
    metadata?: EventMetadata,
    transport?: TransportMetadata,
  ) {
    super(payload, metadata, transport);
  }
}
