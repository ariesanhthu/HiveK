import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums';

export interface PaymentAuthorizedPayload {
  paymentId: string;
  paymentAttemptId: string;
  capturedBy: string;
  amount: number;
  idempotencyKey: string;
}

export class PaymentAuthorizedEvent extends DomainEvent<PaymentAuthorizedPayload> {
  public readonly eventType = 'PaymentAuthorized';
  public readonly aggregateType = EAggregateType.PAYMENT;

  constructor(
    aggregateId: string,
    payload: PaymentAuthorizedPayload,
    metadata?: Record<string, unknown>,
  ) {
    super(aggregateId, payload, metadata);
  }
}
