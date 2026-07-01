import type { JsonRecord } from '@/shared/types';
import { type ECurrency } from '../../enums';

export interface IPaymentProviderResponse {
	transactionId?: string; // External transaction id provided by payment provider
	isSuccess: boolean; // Did the event represent success?
	status: 'authorized' | 'succeeded' | 'failed' | 'pending' | 'expired'; // Payment status
	errorMessage?: string; // Error message
}

export interface IPaymentProviderResult {
	requestPayload?: JsonRecord;
	responsePayload?: JsonRecord;
	requestHeaders?: JsonRecord;
	responseHeaders?: JsonRecord;
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
	metadata?: JsonRecord;
	rawPayload: JsonRecord; // The full webhook JSON (from payment provider)
	response: {
		// Response from server to payment provider
		payload?: JsonRecord;
		statusCode: number;
	};
}

export interface IPaymentProviderMetadata {
	url?: string;
	webhookUrl?: string;
	redirectUrl?: string;
	credentials?: JsonRecord;
	others?: JsonRecord;
}

export interface IPaymentProviderField {
	key: string; // The actual JSON key (e.g., 'access_key')
	label: string; // What the user sees (e.g., 'Momo Access Key')
	required: boolean;
	description?: string; // Helper text
}

export interface IPaymentProvider {
	code: string;
	CREDENTIAL_FIELDS: IPaymentProviderField[];
	getCredentialFields(): IPaymentProviderField[];
	checkCredentialFields(credentials: JsonRecord): boolean;
	create(
		id: string,
		amount: number,
		currency: ECurrency,
		metadata?: IPaymentProviderMetadata
	): Promise<IPaymentProviderCreateResult>;
	refund(
		transactionId: string,
		amount: number,
		currency: ECurrency,
		metadata?: IPaymentProviderMetadata
	): Promise<IPaymentProviderResult>;
	verifyWebhook(data: JsonRecord, metadata?: IPaymentProviderMetadata): boolean; // Received webhook data, return true if the webhook is valid
	extractPaymentAttemptId(data: JsonRecord): string; // Received webhook data, return payment attempt id
	parseWebhook(
		data: JsonRecord,
		metadata?: IPaymentProviderMetadata
	): IPaymentProviderWebhookResult; // Received webhook data, return parsed webhook result
	capture(
		transactionId: string,
		attemptId: string,
		amount: number,
		currency: ECurrency,
		metadata?: IPaymentProviderMetadata
	): Promise<IPaymentProviderResult>;
	cancel(
		transactionId: string,
		amount: number,
		currency: ECurrency,
		metadata?: IPaymentProviderMetadata
	): Promise<IPaymentProviderResult>;
	query(
		transactionId: string,
		metadata?: IPaymentProviderMetadata
	): Promise<IPaymentProviderResult>;
	createWithSubscription?(
		id: string,
		tenantId: string,
		amount: number,
		currency: ECurrency,
		metadata?: IPaymentProviderMetadata
	): Promise<IPaymentProviderCreateResult>;
	createSubscription?(
		id: string,
		tenantId: string,
		amount: number,
		currency: ECurrency,
		metadata?: IPaymentProviderMetadata
	): Promise<IPaymentProviderCreateResult>;
	paySubscription?(
		id: string,
		tenantId: string,
		amount: number,
		currency: ECurrency,
		metadata?: IPaymentProviderMetadata
	): Promise<IPaymentProviderCreateResult>;
}

export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');
