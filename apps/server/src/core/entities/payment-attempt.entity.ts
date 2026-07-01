import { BaseEntity } from '../common';
import { ECurrency } from '../enums';
import {
  type EFailureType,
  EPaymentAttemptStatus,
  ETransactionStatus,
  EPaymentTransactionType,
} from '../enums';
import { MoneyVO, PaymentAttemptStatusVO, FailureTypeVO } from '../value-objects';
import { type PaymentTransactionEntity } from './payment-transaction.entity';
import { type Nullable, type Optional } from '../types';

export type FieldChanges = Record<string, { old: unknown; new: unknown }>;

export interface PaymentAttemptProps {
  paymentProviderId: string;
  attemptNumber: number;
  status: PaymentAttemptStatusVO;
  providerTransactionId: Optional<string>;
  paymentUrl: Optional<string>;
  idempotencyKey: string;
  failureReason: Optional<string>;
  failureType: Optional<FailureTypeVO>;
  totalRefundedAmount: Optional<MoneyVO>;
  transactions: PaymentTransactionEntity[];
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentAttemptCreateProps = Omit<
  PaymentAttemptProps,
  | 'providerTransactionId'
  | 'paymentUrl'
  | 'failureReason'
  | 'failureType'
  | 'totalRefundedAmount'
  | 'transactions'
  | 'createdAt'
  | 'updatedAt'
> & {
  providerTransactionId?: Optional<string>;
  paymentUrl?: Optional<string>;
  failureReason?: Optional<string>;
  failureType?: Optional<FailureTypeVO>;
  totalRefundedAmount?: Optional<MoneyVO>;
  transactions?: PaymentTransactionEntity[];
  createdAt?: Date;
  updatedAt?: Date;
};

export class PaymentAttemptEntity extends BaseEntity<PaymentAttemptProps> {
  public static create(input: PaymentAttemptCreateProps, id?: string): PaymentAttemptEntity {
    const now = new Date();
    return new PaymentAttemptEntity({
      ...input,
      providerTransactionId: input.providerTransactionId,
      paymentUrl: input.paymentUrl,
      failureReason: input.failureReason,
      failureType: input.failureType,
      totalRefundedAmount: input.totalRefundedAmount,
      transactions: input.transactions ?? [],
      createdAt: input.createdAt ?? now,
      updatedAt: input.updatedAt ?? now,
    }, id);
  }

  public static instantiate(id: string, props: PaymentAttemptProps): PaymentAttemptEntity {
    return new PaymentAttemptEntity(props, id);
  }

  public static getFieldChanges(
    old: PaymentAttemptEntity,
    current: PaymentAttemptEntity
  ): FieldChanges {
    const changes: FieldChanges = {};
    const ignoreKeys = ['updatedAt'];

    const getValue = (key: string, val: unknown) => {
      if (key === 'transactions' && Array.isArray(val)) {
        return val.map((x) => x.id);
      }
      if (val && typeof val === 'object') {
        if ('value' in val) return val.value;
        if ('amount' in val && 'currency' in val) {
          return { amount: (val as MoneyVO).amount, currency: (val as MoneyVO).currency };
        }
      }
      return val;
    };

    const currentProps = current.props;
    const oldProps = old.props;
    for (const key of Object.keys(currentProps)) {
      if (ignoreKeys.includes(key)) continue;

      const oldValue = oldProps[key as keyof typeof oldProps];
      const newValue = currentProps[key as keyof typeof currentProps];

      const oldVal = getValue(key, oldValue);
      const newVal = getValue(key, newValue);

      const oldStr = JSON.stringify(oldVal);
      const newStr = JSON.stringify(newVal);

      if (oldStr !== newStr) {
        changes[key] = {
          old: oldVal,
          new: newVal,
        };
      }
    }
    return changes;
  }

  private constructor(props: PaymentAttemptProps, id?: string) {
    super(props, id);
  }

  public get status(): PaymentAttemptStatusVO {
    return this.props.status;
  }
  public get createdAt(): Date {
    return this.props.createdAt;
  }
  public get providerTransactionId(): string | undefined {
    return this.props.providerTransactionId;
  }
  public get paymentUrl(): string | undefined {
    return this.props.paymentUrl;
  }
  public get idempotencyKey(): string {
    return this.props.idempotencyKey;
  }
  public get paymentProviderId(): string {
    return this.props.paymentProviderId;
  }
  public get attemptNumber(): number {
    return this.props.attemptNumber;
  }
  public get failureReason(): string | undefined {
    return this.props.failureReason;
  }
  public get failureType(): FailureTypeVO | undefined {
    return this.props.failureType;
  }
  public get totalRefundedAmount(): MoneyVO | undefined {
    return this.props.totalRefundedAmount;
  }
  public get transactions(): PaymentTransactionEntity[] {
    return this.props.transactions;
  }
  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public set paymentUrl(url: string) {
    this.props.paymentUrl = url;
  }
  public set updatedAt(date: Date) {
    this.props.updatedAt = date;
  }

  public getCapturedAmount(): MoneyVO {
    const currency = this.props.transactions[0]?.amount.currency ?? ECurrency.VND;

    return this.props.transactions
      .filter(
        (t) =>
          t.transactionType === EPaymentTransactionType.CAPTURE &&
          t.status === ETransactionStatus.SUCCESS
      )
      .reduce((sum, t) => sum.add(t.amount), MoneyVO.zero(currency));
  }

  public getRefundedAmount(): MoneyVO {
    const currency = this.props.transactions[0]?.amount.currency ?? ECurrency.VND;

    return this.props.transactions
      .filter(
        (t) =>
          t.transactionType === EPaymentTransactionType.REFUND &&
          t.status === ETransactionStatus.SUCCESS
      )
      .reduce((sum, t) => sum.add(t.amount), MoneyVO.zero(currency));
  }

  public getRemainingRefundableAmount(): MoneyVO {
    const captured = this.getCapturedAmount();
    const refunded = this.getRefundedAmount();
    return captured.subtract(refunded);
  }

  public isFullyRefunded(): boolean {
    return this.getRemainingRefundableAmount().isZero();
  }

  public isPartiallyRefunded(): boolean {
    const refunded = this.getRefundedAmount();
    return refunded.isPositive() && !this.isFullyRefunded();
  }

  public addTransaction(transaction: PaymentTransactionEntity): void {
    if (this.props.transactions.length > 0) {
      const existingCurrency = this.props.transactions[0].amount.currency;
      if (transaction.amount.currency !== existingCurrency) {
        throw new Error(
          `Currency mismatch in attempt ${this.id}: ` +
            `expected ${existingCurrency}, got ${transaction.amount.currency}`
        );
      }
    }

    if (
      transaction.status === ETransactionStatus.SUCCESS &&
      transaction.providerTransactionId &&
      !this.props.providerTransactionId
    ) {
      this.props.providerTransactionId = transaction.providerTransactionId;
    }

    this.props.transactions.push(transaction);
    this.props.updatedAt = new Date();
  }

  public getLatestTransaction(): Nullable<PaymentTransactionEntity> {
    if (this.props.transactions.length === 0) return null;
    return this.props.transactions.reduce((latest, current) =>
      current.createdAt > latest.createdAt ? current : latest
    );
  }

  public receiveWebhook(): void {
    if (this.props.status.isTerminal()) {
      return;
    }
    if (this.props.status.isInitiated()) {
      this.props.status = this.props.status.transition(EPaymentAttemptStatus.PROCESSING);
    }
  }

  public transitionStatus(): void {
    const lastTransaction = this.getLatestTransaction();
    if (!lastTransaction) {
      return;
    }

    if (lastTransaction.status === ETransactionStatus.PENDING) {
      return;
    }

    if (lastTransaction.status === ETransactionStatus.FAILED) {
      if (
        [
          EPaymentTransactionType.CREATE,
          EPaymentTransactionType.AUTHORIZATION,
          EPaymentTransactionType.CAPTURE,
        ].includes(lastTransaction.transactionType)
      ) {
        this.props.status = this.props.status.transition(EPaymentAttemptStatus.FAILED);
      }
      return;
    }

    switch (lastTransaction.transactionType) {
      case EPaymentTransactionType.CREATE:
        this.props.status = this.props.status.transition(EPaymentAttemptStatus.INITIATED);
        break;
      case EPaymentTransactionType.AUTHORIZATION:
        this.props.status = this.props.status.transition(EPaymentAttemptStatus.PROCESSING);
        break;
      case EPaymentTransactionType.CAPTURE:
        this.props.status = this.props.status.transition(EPaymentAttemptStatus.SUCCESS);
        break;
      case EPaymentTransactionType.CANCEL:
        this.props.status = this.props.status.transition(EPaymentAttemptStatus.CANCELED);
        break;
      case EPaymentTransactionType.REFUND:
        if (this.isFullyRefunded()) {
          this.props.status = this.props.status.transition(
            EPaymentAttemptStatus.REFUNDED
          );
        } else {
          this.props.status = this.props.status.transition(
            EPaymentAttemptStatus.PARTIALLY_REFUNDED
          );
        }
        break;
    }
  }

  public cancel(): void {
    if (this.status.isTerminal()) {
      return;
    }
    this.props.status = this.props.status.transition(EPaymentAttemptStatus.CANCELED);
    this.props.updatedAt = new Date();
  }

  public canRetry(): boolean {
    if (!this.props.failureType) {
      return true;
    }
    return this.props.failureType.isRetriable;
  }

  public getUserErrorMessage(): string | undefined {
    return this.props.failureType?.userMessage;
  }

  public recordFailure(reason: string, type: EFailureType): void {
    this.props.failureReason = reason;
    this.props.failureType = FailureTypeVO.fromType(type);
    this.props.status = this.props.status.transition(EPaymentAttemptStatus.FAILED);
    this.props.updatedAt = new Date();
  }
}
