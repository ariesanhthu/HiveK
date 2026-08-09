import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums/aggregate-type.enum';

export interface ThreadsConnectedPayload {
  socialPageId: string;
  enterpriseId: string;
  threadsUserId: string;
  threadsUsername: string;
}

export class ThreadsConnectedEvent extends DomainEvent<ThreadsConnectedPayload> {
  public readonly eventType = 'ThreadsConnected';
  public readonly aggregateType = EAggregateType.SOCIAL_PAGE;

  constructor(
    aggregateId: string,
    payload: ThreadsConnectedPayload,
    metadata?: Record<string, unknown>,
  ) {
    super(aggregateId, payload, metadata);
  }
}
