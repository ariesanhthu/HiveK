import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPaymentProviderCredentialFieldsQuery } from './get-payment-provider-credential-fields.query';
import {
	type IPaymentProviderDiscovery,
	PAYMENT_PROVIDER_DISCOVERY,
	IPaymentProviderField,
} from '@/core';

@QueryHandler(GetPaymentProviderCredentialFieldsQuery)
export class GetPaymentProviderCredentialFieldsHandler implements IQueryHandler<GetPaymentProviderCredentialFieldsQuery> {
	constructor(
		@Inject(PAYMENT_PROVIDER_DISCOVERY)
		private readonly providerDiscovery: IPaymentProviderDiscovery
	) {}

	async execute(
		query: GetPaymentProviderCredentialFieldsQuery
	): Promise<IPaymentProviderField[]> {
		const { code } = query;
		const provider = this.providerDiscovery.findProvider(code);
		if (!provider) {
			throw new Error(`Payment provider ${code} not found`);
		}
		return provider.getCredentialFields();
	}
}
