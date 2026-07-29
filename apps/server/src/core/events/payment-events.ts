import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums';

export class PaymentAttemptStartedEvent extends DomainEvent<{
  paymentId: string;
  attemptId: string;
  attemptNumber: number;
  paymentProviderId: string;
}> {
  public readonly eventType = 'PaymentAttemptStarted';
  public readonly aggregateType = EAggregateType.PAYMENT;

  constructor(
    paymentId: string,
    attemptId: string,
    attemptNumber: number,
    paymentProviderId: string,
  ) {
    super(paymentId, {
      paymentId,
      attemptId,
      attemptNumber,
      paymentProviderId,
    });
  }
}

export class PaymentFailedEvent extends DomainEvent<{
  paymentId: string;
  attemptId: string;
  failureReason: string;
  failureType: string;
}> {
  public readonly eventType = 'PaymentFailed';
  public readonly aggregateType = EAggregateType.PAYMENT;

  constructor(
    paymentId: string,
    attemptId: string,
    failureReason: string,
    failureType: string,
  ) {
    super(paymentId, { paymentId, attemptId, failureReason, failureType });
  }
}

export class PaymentRefundedEvent extends DomainEvent<{
  paymentId: string;
  attemptId: string;
  amount: number;
  currency: string;
  isFullRefund: boolean;
}> {
  public readonly eventType = 'PaymentRefunded';
  public readonly aggregateType = EAggregateType.PAYMENT;

  constructor(
    paymentId: string,
    attemptId: string,
    amount: number,
    currency: string,
    isFullRefund: boolean,
  ) {
    super(paymentId, { paymentId, attemptId, amount, currency, isFullRefund });
  }
}

export class TransactionRecordedEvent extends DomainEvent<{
  paymentId: string;
  attemptId: string;
  transactionId: string;
  transactionType: string;
  transactionSource: string;
  status: string;
  amount: number;
  currency: string;
}> {
  public readonly eventType = 'TransactionRecorded';
  public readonly aggregateType = EAggregateType.PAYMENT;

  constructor(
    paymentId: string,
    attemptId: string,
    transactionId: string,
    transactionType: string,
    transactionSource: string,
    status: string,
    amount: number,
    currency: string,
  ) {
    super(paymentId, {
      paymentId,
      attemptId,
      transactionId,
      transactionType,
      transactionSource,
      status,
      amount,
      currency,
    });
  }
}

export class PaymentCancelAttemptedEvent extends DomainEvent<{
  paymentId: string;
  attemptId: string;
}> {
  public readonly eventType = 'PaymentCancelAttempted';
  public readonly aggregateType = EAggregateType.PAYMENT;

  constructor(paymentId: string, attemptId: string) {
    super(paymentId, { paymentId, attemptId });
  }
}
