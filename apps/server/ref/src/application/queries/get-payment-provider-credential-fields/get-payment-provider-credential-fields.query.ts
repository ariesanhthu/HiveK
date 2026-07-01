import { Query } from '@nestjs/cqrs';
import type { IPaymentProviderField } from '@/core';

export class GetPaymentProviderCredentialFieldsQuery extends Query<IPaymentProviderField[]> {
	constructor(public readonly code: string) {
		super();
	}
}
