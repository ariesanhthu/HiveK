import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums/aggregate-type.enum';

export interface PostFailedPayload {
  postId: string;
  enterpriseId: string;
  socialPageId: string;
  failReason: string;
  failedAt: Date;
}

export class PostFailedEvent extends DomainEvent<PostFailedPayload> {
  public readonly eventType = 'PostFailed';
  public readonly aggregateType = EAggregateType.SCHEDULED_POST;

  constructor(
    aggregateId: string,
    payload: PostFailedPayload,
    metadata?: Record<string, unknown>,
  ) {
    super(aggregateId, payload, metadata);
  }
}
