import { Module } from '@nestjs/common';
import { MomoService } from './momo/momo.service';
import { IPaymentProvider, PAYMENT_PROVIDER_DISCOVERY, PAYMENT_PROVIDERS } from '@/core';
import { HttpModule } from '@nestjs/axios';
import { PaymentProviderDiscoveryService } from './payment-provider-discovery.service';

const LIST_PAYMENT_PROVIDER = [MomoService];

@Module({
	imports: [HttpModule],
	providers: [
		...LIST_PAYMENT_PROVIDER,
		{
			provide: PAYMENT_PROVIDERS,
			useFactory: (...providers) => {
				const providerMap: { [key: string]: IPaymentProvider } = {};
				providers.forEach((provider: IPaymentProvider) => {
					providerMap[provider.code] = provider;
				});
				return providerMap;
			},
			inject: [...LIST_PAYMENT_PROVIDER],
		},
		{
			provide: PAYMENT_PROVIDER_DISCOVERY,
			useClass: PaymentProviderDiscoveryService,
		},
	],

	exports: [...LIST_PAYMENT_PROVIDER, PAYMENT_PROVIDER_DISCOVERY],
})
export class PaymentProviderDiscoveryModule {}
