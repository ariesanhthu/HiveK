import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums/aggregate-type.enum';

export interface PostPublishedPayload {
  postId: string;
  enterpriseId: string;
  socialPageId: string;
  platformPostId: string;
  publishedAt: Date;
}

export class PostPublishedEvent extends DomainEvent<PostPublishedPayload> {
  public readonly eventType = 'PostPublished';
  public readonly aggregateType = EAggregateType.SCHEDULED_POST;

  constructor(
    aggregateId: string,
    payload: PostPublishedPayload,
    metadata?: Record<string, unknown>,
  ) {
    super(aggregateId, payload, metadata);
  }
}
