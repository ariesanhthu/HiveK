import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums/aggregate-type.enum';

export interface PostScheduledPayload {
  postId: string;
  enterpriseId: string;
  socialPageId: string;
  scheduledAt: Date;
}

export class PostScheduledEvent extends DomainEvent<PostScheduledPayload> {
  public readonly eventType = 'PostScheduled';
  public readonly aggregateType = EAggregateType.SCHEDULED_POST;

  constructor(
    aggregateId: string,
    payload: PostScheduledPayload,
    metadata?: Record<string, unknown>,
  ) {
    super(aggregateId, payload, metadata);
  }
}
