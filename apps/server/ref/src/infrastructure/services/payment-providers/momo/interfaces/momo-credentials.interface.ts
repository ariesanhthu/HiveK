import { type IPaymentProviderMetadata } from '@/core';

export interface IMomoCredentials {
	access_key: string;
	secret_key: string;
	partner_code: string;
	partner_name?: string;
	store_id?: string;
	store_name?: string;

	momo_url: string;
	redirect_url: string;
	ipn_url: string;
}

export interface IMomoMetadata extends IPaymentProviderMetadata {
	url: string;
	webhookUrl: string;
	redirectUrl: string;
	credentials: {
		access_key: string;
		secret_key: string;
		partner_code: string;
		store_id?: string;
		store_name?: string;
	};
	others: {
		order_id?: string;
		attempt_id?: string;
	};
}
