import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums/aggregate-type.enum';

export interface CreditToppedUpPayload {
  enterpriseId: string;
  creditType: string;
  amount: number;
  newBalance: number;
  reason: string;
}

export class CreditToppedUpEvent extends DomainEvent<CreditToppedUpPayload> {
  public readonly eventType = 'CreditToppedUp';
  public readonly aggregateType = EAggregateType.CREDIT_WALLET;

  constructor(
    aggregateId: string,
    payload: CreditToppedUpPayload,
    metadata?: Record<string, unknown>,
  ) {
    super(aggregateId, payload, metadata);
  }
}
