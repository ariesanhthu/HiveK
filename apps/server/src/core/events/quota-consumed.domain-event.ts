import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums/aggregate-type.enum';

export interface QuotaConsumedPayload {
  enterpriseId: string;
  key: string;
  consumedAmount: number;
}

export class QuotaConsumedEvent extends DomainEvent<QuotaConsumedPayload> {
  public readonly eventType = 'QuotaConsumed';
  public readonly aggregateType = EAggregateType.QUOTA_USAGE;

  constructor(
    aggregateId: string,
    payload: QuotaConsumedPayload,
    metadata?: Record<string, unknown>,
  ) {
    super(aggregateId, payload, metadata);
  }
}
