import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums/aggregate-type.enum';

export interface BillCancelledPayload {
  billId: string;
  enterpriseId: string;
  reason: string;
}

export class BillCancelledEvent extends DomainEvent<BillCancelledPayload> {
  public readonly eventType = 'BillCancelled';
  public readonly aggregateType = EAggregateType.BILL;

  constructor(
    aggregateId: string,
    payload: BillCancelledPayload,
    metadata?: Record<string, unknown>,
  ) {
    super(aggregateId, payload, metadata);
  }
}
