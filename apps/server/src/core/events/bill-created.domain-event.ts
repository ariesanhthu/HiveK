import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums/aggregate-type.enum';

export interface BillCreatedPayload {
  billId: string;
  enterpriseId: string;
  totalAmount: number;
  finalAmount: number;
}

export class BillCreatedEvent extends DomainEvent<BillCreatedPayload> {
  public readonly eventType = 'BillCreated';
  public readonly aggregateType = EAggregateType.BILL;

  constructor(
    aggregateId: string,
    payload: BillCreatedPayload,
    metadata?: Record<string, unknown>,
  ) {
    super(aggregateId, payload, metadata);
  }
}
