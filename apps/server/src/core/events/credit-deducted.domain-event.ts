import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums/aggregate-type.enum';

export interface CreditDeductedPayload {
  enterpriseId: string;
  creditType: string;
  amount: number;
  newBalance: number;
  reason: string;
}

export class CreditDeductedEvent extends DomainEvent<CreditDeductedPayload> {
  public readonly eventType = 'CreditDeducted';
  public readonly aggregateType = EAggregateType.CREDIT_WALLET;

  constructor(
    aggregateId: string,
    payload: CreditDeductedPayload,
    metadata?: Record<string, unknown>,
  ) {
    super(aggregateId, payload, metadata);
  }
}
