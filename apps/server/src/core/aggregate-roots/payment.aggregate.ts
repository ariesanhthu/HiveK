import { BaseAggregateRoot } from '../common';
import { MoneyVO, PaymentStatusVO } from '../value-objects';
import { type PaymentAttemptEntity } from '../entities/payment-attempt.entity';
import { type Nullable, type Optional } from '../types';
import { EPaymentStatus } from '../enums';
import { type FieldChanges } from '../entities/payment-attempt.entity';

export interface PaymentProps {
  enterpriseId: string;
  userId: Nullable<string>;
  billId: string;
  amount: MoneyVO;
  status: PaymentStatusVO;
  description: Optional<string>;
  idempotencyKey: string;
  version: number;
  expiresAt: Optional<Date>;
  canceledAt: Optional<Date>;
  canceledBy: Optional<string>;
  cancelReason: Optional<string>;
  metadata: Optional<Record<string, unknown>>;
  paymentAttempts: PaymentAttemptEntity[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Optional<Date>;
  deletedBy: Optional<string>;
}

export type PaymentCreateProps = Omit<
  PaymentProps,
  | 'status'
  | 'version'
  | 'paymentAttempts'
  | 'createdAt'
  | 'updatedAt'
  | 'expiresAt'
  | 'canceledAt'
  | 'canceledBy'
  | 'cancelReason'
  | 'deletedAt'
  | 'deletedBy'
> & {
  status?: PaymentStatusVO;
  version?: number;
  paymentAttempts?: PaymentAttemptEntity[];
  createdAt?: Date;
  updatedAt?: Date;
  expiresAt?: Date;
};

export class PaymentEntity extends BaseAggregateRoot<PaymentProps> {
  /**
   * Static factory method to create a new Payment instance with defaults.
   */
  public static create(input: PaymentCreateProps): PaymentEntity {
    const now = new Date();
    const payment = new PaymentEntity({
      enterpriseId: input.enterpriseId,
      userId: input.userId,
      billId: input.billId,
      amount: input.amount,
      status: input.status ?? new PaymentStatusVO(EPaymentStatus.PENDING),
      description: input.description,
      idempotencyKey: input.idempotencyKey,
      version: input.version ?? 1,
      metadata: input.metadata,
      paymentAttempts: input.paymentAttempts ?? [],
      createdAt: input.createdAt ?? now,
      updatedAt: input.updatedAt ?? now,
      expiresAt: input.expiresAt,
      canceledAt: undefined,
      canceledBy: undefined,
      cancelReason: undefined,
      deletedAt: undefined,
      deletedBy: undefined,
    });

    return payment;
  }

  public static instantiate(id: string, props: PaymentProps): PaymentEntity {
    return new PaymentEntity(props, id);
  }

  public static getFieldChanges(
    old: PaymentEntity,
    current: PaymentEntity,
  ): FieldChanges {
    const changes: FieldChanges = {};
    const ignoreKeys = ['updatedAt', 'version'];

    const getValue = (key: string, val: unknown) => {
      if (key === 'paymentAttempts' && Array.isArray(val)) {
        return val.map((x) => x.id);
      }
      if (val && typeof val === 'object') {
        if ('value' in val) return val.value;
        if ('amount' in val && 'currency' in val) {
          return {
            amount: (val as MoneyVO).amount,
            currency: (val as MoneyVO).currency,
          };
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

  private constructor(props: PaymentProps, id?: string) {
    super(props, id);
  }

  public getSuccessfulAttempt(): Nullable<PaymentAttemptEntity> {
    return (
      this.props.paymentAttempts.find((attempt) =>
        attempt.status.isSuccess(),
      ) ?? null
    );
  }

  public getLatestAttempt(): Nullable<PaymentAttemptEntity> {
    if (this.props.paymentAttempts.length === 0) return null;
    return this.props.paymentAttempts.reduce((latest, current) =>
      current.createdAt > latest.createdAt ? current : latest,
    );
  }

  public getAttemptById(id: string): Nullable<PaymentAttemptEntity> {
    return (
      this.props.paymentAttempts.find((attempt) => attempt.id === id) ?? null
    );
  }

  public canRetry(): boolean {
    const latestAttempt = this.getLatestAttempt();
    if (!latestAttempt) return true; // No attempts yet, can start
    return (
      latestAttempt.status.isFailed() ||
      latestAttempt.status.isCanceled() ||
      latestAttempt.status.isInitiated()
    );
  }

  public getPaymentUrl(): string | undefined {
    return this.getLatestAttempt()?.paymentUrl;
  }

  public setPaymentUrl(url: string): void {
    const latestAttempt = this.getLatestAttempt();
    if (!latestAttempt) {
      throw new Error('Payment attempt not found');
    }
    latestAttempt.paymentUrl = url;
    latestAttempt.updatedAt = new Date();
  }

  public markAsDeleted(by: string): void {
    this.props.deletedAt = new Date();
    this.props.deletedBy = by;
    this.props.updatedAt = new Date();
  }

  public getTotalRefundedAmount(): MoneyVO {
    const successfulAttempt = this.getSuccessfulAttempt();
    return (
      successfulAttempt?.getRefundedAmount() ??
      MoneyVO.zero(this.props.amount.currency)
    );
  }

  public getRemainingRefundableAmount(): MoneyVO {
    const successfulAttempt = this.getSuccessfulAttempt();
    return (
      successfulAttempt?.getRemainingRefundableAmount() ??
      MoneyVO.zero(this.props.amount.currency)
    );
  }

  public canBeRefunded(): boolean {
    return (
      this.props.status.isCompleted() || this.props.status.isPartiallyRefunded()
    );
  }

  public isFullyRefunded(): boolean {
    return this.props.status.isRefunded();
  }

  public updateStatus(newStatus: EPaymentStatus): void {
    this.props.status = this.props.status.transition(newStatus);
    this.props.updatedAt = new Date();
  }

  public setCancelDetails(reason: string, by: string): void {
    this.props.canceledAt = new Date();
    this.props.canceledBy = by;
    this.props.cancelReason = reason;
    this.props.updatedAt = new Date();
  }
  public get enterpriseId(): string {
    return this.props.enterpriseId;
  }
  public get userId(): Nullable<string> {
    return this.props.userId;
  }
  public get billId(): string {
    return this.props.billId;
  }
  public get amount(): MoneyVO {
    return this.props.amount;
  }
  public get status(): PaymentStatusVO {
    return this.props.status;
  }
  public get description(): Optional<string> {
    return this.props.description;
  }
  public get idempotencyKey(): string {
    return this.props.idempotencyKey;
  }
  public get version(): number {
    return this.props.version;
  }
  public get expiresAt(): Optional<Date> {
    return this.props.expiresAt;
  }
  public get canceledAt(): Optional<Date> {
    return this.props.canceledAt;
  }
  public get canceledBy(): Optional<string> {
    return this.props.canceledBy;
  }
  public get cancelReason(): Optional<string> {
    return this.props.cancelReason;
  }
  public get metadata(): Record<string, unknown> {
    return this.props.metadata ?? {};
  }
  public get paymentAttempts(): PaymentAttemptEntity[] {
    return this.props.paymentAttempts;
  }
  public get createdAt(): Date {
    return this.props.createdAt;
  }
  public get updatedAt(): Date {
    return this.props.updatedAt;
  }
  public get deletedAt(): Optional<Date> {
    return this.props.deletedAt;
  }
  public get deletedBy(): Optional<string> {
    return this.props.deletedBy;
  }
  public recordEvent(event: any): void {
    this.addDomainEvent(event);
  }
}
