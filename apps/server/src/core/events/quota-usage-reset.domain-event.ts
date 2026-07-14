import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums/aggregate-type.enum';

export interface QuotaUsageResetPayload {
  enterpriseId: string;
  resetKeys: string[];
}

export class QuotaUsageResetEvent extends DomainEvent<QuotaUsageResetPayload> {
  public readonly eventType = 'QuotaUsageReset';
  public readonly aggregateType = EAggregateType.QUOTA_USAGE;

  constructor(
    aggregateId: string,
    payload: QuotaUsageResetPayload,
    metadata?: Record<string, unknown>
  ) {
    super(aggregateId, payload, metadata);
  }
}
