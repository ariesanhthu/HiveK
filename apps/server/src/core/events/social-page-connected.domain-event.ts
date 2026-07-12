import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums/aggregate-type.enum';

export interface SocialPageConnectedPayload {
  socialPageId: string;
  enterpriseId: string;
  platformCode: string;
  pageId: string;
  pageName: string;
}

export class SocialPageConnectedEvent extends DomainEvent<SocialPageConnectedPayload> {
  public readonly eventType = 'SocialPageConnected';
  public readonly aggregateType = EAggregateType.SOCIAL_PAGE;

  constructor(
    aggregateId: string,
    payload: SocialPageConnectedPayload,
    metadata?: Record<string, unknown>,
  ) {
    super(aggregateId, payload, metadata);
  }
}
