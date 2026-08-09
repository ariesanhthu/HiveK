import { BaseValueObject } from '../common';
import { EPaymentAttemptStatus } from '../enums';

export class PaymentAttemptStatusVO extends BaseValueObject<{
  value: EPaymentAttemptStatus;
}> {
  constructor(status: EPaymentAttemptStatus) {
    super({ value: status });
  }

  get value(): EPaymentAttemptStatus {
    return this.props.value;
  }

  private static readonly VALID_TRANSITIONS: Record<
    EPaymentAttemptStatus,
    EPaymentAttemptStatus[]
  > = {
    [EPaymentAttemptStatus.INITIATED]: [
      EPaymentAttemptStatus.INITIATED,
      EPaymentAttemptStatus.PROCESSING,
      EPaymentAttemptStatus.CANCELED,
      EPaymentAttemptStatus.FAILED,
    ],
    [EPaymentAttemptStatus.PROCESSING]: [
      EPaymentAttemptStatus.PROCESSING,
      EPaymentAttemptStatus.SUCCESS,
      EPaymentAttemptStatus.FAILED,
      EPaymentAttemptStatus.CANCELED,
    ],
    [EPaymentAttemptStatus.SUCCESS]: [
      EPaymentAttemptStatus.SUCCESS,
      EPaymentAttemptStatus.PARTIALLY_REFUNDED,
      EPaymentAttemptStatus.REFUNDED,
    ],
    [EPaymentAttemptStatus.FAILED]: [EPaymentAttemptStatus.FAILED],
    [EPaymentAttemptStatus.CANCELED]: [EPaymentAttemptStatus.CANCELED],
    [EPaymentAttemptStatus.PARTIALLY_REFUNDED]: [
      EPaymentAttemptStatus.PARTIALLY_REFUNDED,
      EPaymentAttemptStatus.REFUNDED,
    ],
    [EPaymentAttemptStatus.REFUNDED]: [EPaymentAttemptStatus.REFUNDED],
  };

  public canTransitionTo(newStatus: EPaymentAttemptStatus): boolean {
    const validNextStates =
      PaymentAttemptStatusVO.VALID_TRANSITIONS[this.value] || [];
    return validNextStates.includes(newStatus);
  }

  public transition(newStatus: EPaymentAttemptStatus): PaymentAttemptStatusVO {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(
        `Invalid attempt state transition: ${this.value} -> ${newStatus}`,
      );
    }
    return new PaymentAttemptStatusVO(newStatus);
  }

  public isInitiated(): boolean {
    return this.value === EPaymentAttemptStatus.INITIATED;
  }

  public isProcessing(): boolean {
    return this.value === EPaymentAttemptStatus.PROCESSING;
  }

  public isSuccess(): boolean {
    return this.value === EPaymentAttemptStatus.SUCCESS;
  }

  public isFailed(): boolean {
    return this.value === EPaymentAttemptStatus.FAILED;
  }

  public isCanceled(): boolean {
    return this.value === EPaymentAttemptStatus.CANCELED;
  }

  public isRefunded(): boolean {
    return this.value === EPaymentAttemptStatus.REFUNDED;
  }

  public isPartiallyRefunded(): boolean {
    return this.value === EPaymentAttemptStatus.PARTIALLY_REFUNDED;
  }

  public isTerminal(): boolean {
    return (
      this.isSuccess() ||
      this.isFailed() ||
      this.isCanceled() ||
      this.isRefunded()
    );
  }
}
