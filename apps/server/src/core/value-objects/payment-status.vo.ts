import { BaseValueObject } from '../common';
import { EPaymentStatus } from '../enums';

export class PaymentStatusVO extends BaseValueObject<{
  value: EPaymentStatus;
}> {
  constructor(status: EPaymentStatus) {
    super({ value: status });
  }

  get value(): EPaymentStatus {
    return this.props.value;
  }

  // Valid state transitions map
  private static readonly VALID_TRANSITIONS: Record<
    EPaymentStatus,
    EPaymentStatus[]
  > = {
    [EPaymentStatus.PENDING_PAYMENT_PROVIDER]: [
      EPaymentStatus.PENDING_PAYMENT_PROVIDER,
      EPaymentStatus.PENDING,
      EPaymentStatus.FAILED,
      EPaymentStatus.CANCELED,
    ],
    [EPaymentStatus.PENDING]: [
      EPaymentStatus.PENDING,
      EPaymentStatus.PROCESSING,
      EPaymentStatus.CANCELED,
    ],
    [EPaymentStatus.PROCESSING]: [
      EPaymentStatus.PROCESSING,
      EPaymentStatus.COMPLETED,
      EPaymentStatus.FAILED,
      EPaymentStatus.CANCELED,
      EPaymentStatus.PENDING_PAYMENT_PROVIDER,
    ],
    [EPaymentStatus.COMPLETED]: [
      EPaymentStatus.COMPLETED,
      EPaymentStatus.PARTIALLY_REFUNDED,
      EPaymentStatus.REFUNDED,
    ],
    [EPaymentStatus.FAILED]: [
      EPaymentStatus.FAILED,
      EPaymentStatus.PENDING, // Allow retry
    ],
    [EPaymentStatus.PARTIALLY_REFUNDED]: [
      EPaymentStatus.PARTIALLY_REFUNDED,
      EPaymentStatus.REFUNDED, // Complete the refund
    ],
    [EPaymentStatus.REFUNDED]: [EPaymentStatus.REFUNDED], // Terminal state
    [EPaymentStatus.CANCELED]: [EPaymentStatus.CANCELED], // Terminal state
  };

  public canTransitionTo(newStatus: EPaymentStatus): boolean {
    const validNextStates = PaymentStatusVO.VALID_TRANSITIONS[this.value] || [];
    return validNextStates.includes(newStatus);
  }

  public transition(newStatus: EPaymentStatus): PaymentStatusVO {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(
        `Invalid state transition: ${this.value} -> ${newStatus}`,
      );
    }
    return new PaymentStatusVO(newStatus);
  }

  public isPendingPaymentProvider(): boolean {
    return this.value === EPaymentStatus.PENDING_PAYMENT_PROVIDER;
  }

  public isPending(): boolean {
    return this.value === EPaymentStatus.PENDING;
  }

  public isProcessing(): boolean {
    return this.value === EPaymentStatus.PROCESSING;
  }

  public isCompleted(): boolean {
    return this.value === EPaymentStatus.COMPLETED;
  }

  public isFailed(): boolean {
    return this.value === EPaymentStatus.FAILED;
  }

  public isRefunded(): boolean {
    return this.value === EPaymentStatus.REFUNDED;
  }

  public isPartiallyRefunded(): boolean {
    return this.value === EPaymentStatus.PARTIALLY_REFUNDED;
  }

  public isCanceled(): boolean {
    return this.value === EPaymentStatus.CANCELED;
  }

  public isTerminal(): boolean {
    return this.isRefunded() || this.isCanceled() || this.isFailed();
  }

  public toString(): string {
    return this.value;
  }
}
