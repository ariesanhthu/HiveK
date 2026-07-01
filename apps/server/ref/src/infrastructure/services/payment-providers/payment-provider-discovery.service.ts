import { Inject, Injectable } from '@nestjs/common';
import { IPaymentProvider } from '@/core';
import { IPaymentProviderDiscovery } from '@/core';
import { PAYMENT_PROVIDERS } from '@/core';

@Injectable()
export class PaymentProviderDiscoveryService implements IPaymentProviderDiscovery {
	constructor(
		@Inject(PAYMENT_PROVIDERS)
		private readonly providers: { [key: string]: IPaymentProvider }
	) {}

	findProvider(code?: string) {
		switch (code?.toLocaleLowerCase()) {
			case 'momo':
				return this.providers['momo'];
			default:
				return null;
		}
		return null;
	}
}
