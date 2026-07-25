import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums/aggregate-type.enum';

export interface ThreadsOAuthInitiatedPayload {
  enterpriseId: string;
  userId: string;
}

export class ThreadsOAuthInitiatedEvent extends DomainEvent<ThreadsOAuthInitiatedPayload> {
  public readonly eventType = 'ThreadsOAuthInitiated';
  public readonly aggregateType = EAggregateType.SOCIAL_PAGE;

  constructor(
    aggregateId: string,
    payload: ThreadsOAuthInitiatedPayload,
    metadata?: Record<string, unknown>,
  ) {
    super(aggregateId, payload, metadata);
  }
}