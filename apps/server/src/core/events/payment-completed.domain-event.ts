import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums';

export interface PaymentCompletedPayload {
  paymentId: string;
  billId: string;
  enterpriseId: string;
  attemptId: string;
  amount: number;
  currency: string;
}

export class PaymentCompletedEvent extends DomainEvent<PaymentCompletedPayload> {
  public readonly eventType = 'PaymentCompleted';
  public readonly aggregateType = EAggregateType.PAYMENT;

  constructor(
    aggregateId: string,
    payload: PaymentCompletedPayload,
    metadata?: Record<string, unknown>,
  ) {
    super(aggregateId, payload, metadata);
  }
}
