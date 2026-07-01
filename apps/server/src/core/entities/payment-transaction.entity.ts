import { BaseEntity } from '../common';
import {
  type ETransactionStatus,
  type EPaymentTransactionType,
  type ETransactionSource,
} from '../enums';
import { type MoneyVO } from '../value-objects';
import { type Optional } from '../types';

export interface PaymentTransactionProps {
  transactionType: EPaymentTransactionType;
  transactionSource: ETransactionSource;
  amount: MoneyVO;
  status: ETransactionStatus;
  description: Optional<string>;
  providerTransactionId: Optional<string>;
  providerRequest: Optional<Record<string, unknown>>;
  providerRequestHeaders: Optional<Record<string, string>>;
  providerRequestTimestamp: Optional<Date>;
  providerResponse: Optional<Record<string, unknown>>;
  providerResponseHeaders: Optional<Record<string, string>>;
  providerResponseTimestamp: Optional<Date>;
  metadata: Optional<Record<string, unknown>>;
  createdAt: Date;
}

export type PaymentTransactionCreateProps = Omit<
  PaymentTransactionProps,
  | 'description'
  | 'providerTransactionId'
  | 'providerRequest'
  | 'providerRequestHeaders'
  | 'providerRequestTimestamp'
  | 'providerResponse'
  | 'providerResponseHeaders'
  | 'providerResponseTimestamp'
  | 'metadata'
  | 'createdAt'
> & {
  description?: Optional<string>;
  providerTransactionId?: Optional<string>;
  providerRequest?: Optional<Record<string, unknown>>;
  providerRequestHeaders?: Optional<Record<string, string>>;
  providerRequestTimestamp?: Optional<Date>;
  providerResponse?: Optional<Record<string, unknown>>;
  providerResponseHeaders?: Optional<Record<string, string>>;
  providerResponseTimestamp?: Optional<Date>;
  metadata?: Optional<Record<string, unknown>>;
  createdAt?: Date;
};

export class PaymentTransactionEntity extends BaseEntity<PaymentTransactionProps> {
  public static create(input: PaymentTransactionCreateProps, id?: string): PaymentTransactionEntity {
    const now = new Date();
    return new PaymentTransactionEntity({
      ...input,
      description: input.description,
      providerTransactionId: input.providerTransactionId,
      providerRequest: input.providerRequest,
      providerRequestHeaders: input.providerRequestHeaders,
      providerRequestTimestamp: input.providerRequestTimestamp,
      providerResponse: input.providerResponse,
      providerResponseHeaders: input.providerResponseHeaders,
      providerResponseTimestamp: input.providerResponseTimestamp,
      metadata: input.metadata,
      createdAt: input.createdAt ?? now,
    }, id);
  }

  public static instantiate(id: string, props: PaymentTransactionProps): PaymentTransactionEntity {
    return new PaymentTransactionEntity(props, id);
  }

  /**
   * Static factory method to map provider results into a PaymentTransactionEntity.
   */
  public static fromProvider(params: {
    transactionType: EPaymentTransactionType;
    transactionSource: ETransactionSource;
    amount: MoneyVO;
    status: ETransactionStatus;
    providerTransactionId?: string;
    description?: string;
    requestPayload?: Record<string, unknown>;
    responsePayload?: Record<string, unknown>;
    requestHeaders?: Record<string, string>;
    responseHeaders?: Record<string, string>;
    requestTimestamp?: Date;
    responseTimestamp?: Date;
    metadata?: Record<string, unknown>;
  }): PaymentTransactionEntity {
    return PaymentTransactionEntity.create({
      transactionType: params.transactionType,
      transactionSource: params.transactionSource,
      status: params.status,
      amount: params.amount,
      providerTransactionId: params.providerTransactionId,
      providerRequest: params.requestPayload,
      providerResponse: params.responsePayload,
      providerRequestHeaders: params.requestHeaders,
      providerResponseHeaders: params.responseHeaders,
      providerRequestTimestamp: params.requestTimestamp,
      providerResponseTimestamp: params.responseTimestamp,
      description: params.description,
      metadata: params.metadata,
    });
  }

  private constructor(props: PaymentTransactionProps, id?: string) {
    super(props, id);
  }

  public get amount(): MoneyVO {
    return this.props.amount;
  }
  public get transactionType(): EPaymentTransactionType {
    return this.props.transactionType;
  }
  public get transactionSource(): ETransactionSource {
    return this.props.transactionSource;
  }
  public get status(): ETransactionStatus {
    return this.props.status;
  }
  public get providerTransactionId(): Optional<string> {
    return this.props.providerTransactionId;
  }
  public get description(): Optional<string> {
    return this.props.description;
  }
  public get providerRequest(): Optional<Record<string, unknown>> {
    return this.props.providerRequest;
  }
  public get providerRequestHeaders(): Optional<Record<string, string>> {
    return this.props.providerRequestHeaders;
  }
  public get providerRequestTimestamp(): Optional<Date> {
    return this.props.providerRequestTimestamp;
  }
  public get providerResponse(): Optional<Record<string, unknown>> {
    return this.props.providerResponse;
  }
  public get providerResponseHeaders(): Optional<Record<string, string>> {
    return this.props.providerResponseHeaders;
  }
  public get providerResponseTimestamp(): Optional<Date> {
    return this.props.providerResponseTimestamp;
  }
  public get metadata(): Optional<Record<string, unknown>> {
    return this.props.metadata;
  }
  public get createdAt(): Date {
    return this.props.createdAt;
  }
}
