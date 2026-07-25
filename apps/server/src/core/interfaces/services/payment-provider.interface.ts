import { ECurrency } from '../../enums';

export interface IPaymentProviderResponse {
  transactionId?: string; // External transaction id provided by payment provider
  isSuccess: boolean;
  status: 'authorized' | 'succeeded' | 'failed' | 'pending' | 'expired';
  errorMessage?: string;
}

export interface IPaymentProviderResult {
  requestPayload?: Record<string, unknown>;
  responsePayload?: Record<string, unknown>;
  requestHeaders?: Record<string, unknown>;
  responseHeaders?: Record<string, unknown>;
  requestTimestamp: Date;
  responseTimestamp: Date;
  data: IPaymentProviderResponse;
}

export interface IPaymentProviderCreateResult extends IPaymentProviderResult {
  paymentUrl: string;
}

export interface IPaymentProviderWebhookResult {
  action: 'payment' | 'refund' | 'cancel' | 'other';
  data: IPaymentProviderResponse;
  amount: number;
  currency: ECurrency;
  metadata?: Record<string, unknown>;
  rawPayload: Record<string, unknown>;
  response: {
    payload?: Record<string, unknown>;
    statusCode: number;
  };
}

export interface IPaymentProviderField {
  key: string;
  label: string;
  required: boolean;
  description?: string;
}

export interface IPaymentProvider {
  code: string;
  CREDENTIAL_FIELDS: IPaymentProviderField[];
  getCredentialFields(): IPaymentProviderField[];
  checkCredentialFields(credentials: Record<string, unknown>): boolean;
  create(
    id: string,
    amount: number,
    currency: ECurrency
  ): Promise<IPaymentProviderCreateResult>;
  refund(
    transactionId: string,
    amount: number,
    currency: ECurrency
  ): Promise<IPaymentProviderResult>;
  verifyWebhook(data: Record<string, unknown>): boolean;
  extractPaymentAttemptId(data: Record<string, unknown>): string;
  parseWebhook(
    data: Record<string, unknown>
  ): IPaymentProviderWebhookResult;
  capture(
    transactionId: string,
    attemptId: string,
    amount: number,
    currency: ECurrency
  ): Promise<IPaymentProviderResult>;
  cancel(
    transactionId: string,
    amount: number,
    currency: ECurrency
  ): Promise<IPaymentProviderResult>;
  query(
    transactionId: string
  ): Promise<IPaymentProviderResult>;
}

export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');
export const PAYMENT_PROVIDERS = Symbol('PAYMENT_PROVIDERS');
