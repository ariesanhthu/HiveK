import { BaseAggregateRoot } from '../common';
import { type ECurrency } from '../enums';
import { type EPaymentMethod } from '../enums';
import { type Optional } from '../types';

export interface PaymentProviderProps {
  code: string;
  displayName: string;
  supportedMethods: EPaymentMethod[];
  supportedCurrencies: ECurrency[];
  credentials: Record<string, unknown>; // Encrypted
  isActive: boolean;
  supportsWebhook: boolean;
  supportsRefund: boolean;
  supportsPartialRefund: boolean;
  baseUrl: Optional<string>;
  testUrl: Optional<string>;
  webhookUrl: Optional<string>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Optional<Date>;
  deletedBy: Optional<string>;
}

export type PaymentProviderCreateProps = Omit<
  PaymentProviderProps,
  | 'baseUrl'
  | 'testUrl'
  | 'webhookUrl'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'deletedBy'
> & {
  baseUrl?: Optional<string>;
  testUrl?: Optional<string>;
  webhookUrl?: Optional<string>;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Optional<Date>;
  deletedBy?: Optional<string>;
};

export class PaymentProviderEntity extends BaseAggregateRoot<PaymentProviderProps> {
  public static create(
    input: PaymentProviderCreateProps,
    id?: string,
  ): PaymentProviderEntity {
    const now = new Date();
    return new PaymentProviderEntity(
      {
        ...input,
        baseUrl: input.baseUrl,
        testUrl: input.testUrl,
        webhookUrl: input.webhookUrl,
        createdAt: input.createdAt ?? now,
        updatedAt: input.updatedAt ?? now,
        deletedAt: input.deletedAt,
        deletedBy: input.deletedBy,
      },
      id,
    );
  }

  public static instantiate(
    id: string,
    props: PaymentProviderProps,
  ): PaymentProviderEntity {
    return new PaymentProviderEntity(props, id);
  }

  private constructor(props: PaymentProviderProps, id?: string) {
    super(props, id);
  }

  get code() {
    return this.props.code;
  }
  get displayName() {
    return this.props.displayName;
  }
  get supportedMethods() {
    return this.props.supportedMethods;
  }
  get supportedCurrencies() {
    return this.props.supportedCurrencies;
  }
  get credentials() {
    return this.props.credentials;
  }
  get isActive() {
    return this.props.isActive;
  }
  get supportsWebhook() {
    return this.props.supportsWebhook;
  }
  get supportsRefund() {
    return this.props.supportsRefund;
  }
  get supportsPartialRefund() {
    return this.props.supportsPartialRefund;
  }
  get baseUrl(): Optional<string> {
    return this.props.baseUrl;
  }
  get testUrl(): Optional<string> {
    return this.props.testUrl;
  }
  get webhookUrl(): Optional<string> {
    return this.props.webhookUrl;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  get deletedAt(): Optional<Date> {
    return this.props.deletedAt;
  }
  get deletedBy(): Optional<string> {
    return this.props.deletedBy;
  }
  isDeleted() {
    return !!this.props.deletedAt;
  }

  set displayName(value: string) {
    this.props.displayName = value;
  }
  set supportedMethods(value: EPaymentMethod[]) {
    this.props.supportedMethods = value;
  }
  set supportedCurrencies(value: ECurrency[]) {
    this.props.supportedCurrencies = value;
  }
  set credentials(value: Record<string, unknown>) {
    this.props.credentials = value;
  }
  set isActive(value: boolean) {
    this.props.isActive = value;
  }
  set supportsWebhook(value: boolean) {
    this.props.supportsWebhook = value;
  }
  set supportsRefund(value: boolean) {
    this.props.supportsRefund = value;
  }
  set supportsPartialRefund(value: boolean) {
    this.props.supportsPartialRefund = value;
  }
  set baseUrl(value: string) {
    this.props.baseUrl = value;
  }
  set testUrl(value: string) {
    this.props.testUrl = value;
  }
  set webhookUrl(value: string) {
    this.props.webhookUrl = value;
  }

  public deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  public activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  public update(
    input: Partial<{
      displayName: string;
      supportedMethods: EPaymentMethod[];
      supportedCurrencies: ECurrency[];
      credentials: Record<string, unknown>;
      isActive: boolean;
      supportsWebhook: boolean;
      supportsRefund: boolean;
      supportsPartialRefund: boolean;
      baseUrl: Optional<string>;
      testUrl: Optional<string>;
      webhookUrl: Optional<string>;
    }>,
  ): void {
    if (input.displayName !== undefined)
      this.props.displayName = input.displayName;
    if (input.supportedMethods !== undefined)
      this.props.supportedMethods = input.supportedMethods;
    if (input.supportedCurrencies !== undefined)
      this.props.supportedCurrencies = input.supportedCurrencies;
    if (input.credentials !== undefined)
      this.props.credentials = input.credentials;
    if (input.isActive !== undefined) this.props.isActive = input.isActive;
    if (input.supportsWebhook !== undefined)
      this.props.supportsWebhook = input.supportsWebhook;
    if (input.supportsRefund !== undefined)
      this.props.supportsRefund = input.supportsRefund;
    if (input.supportsPartialRefund !== undefined)
      this.props.supportsPartialRefund = input.supportsPartialRefund;
    if (input.baseUrl !== undefined) this.props.baseUrl = input.baseUrl;
    if (input.testUrl !== undefined) this.props.testUrl = input.testUrl;
    if (input.webhookUrl !== undefined)
      this.props.webhookUrl = input.webhookUrl;

    this.props.updatedAt = new Date();
  }

  public markAsDeleted(deletedBy: string): void {
    this.props.deletedAt = new Date();
    this.props.deletedBy = deletedBy;
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  public restore(): void {
    this.props.deletedAt = undefined;
    this.props.deletedBy = undefined;
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }
}
