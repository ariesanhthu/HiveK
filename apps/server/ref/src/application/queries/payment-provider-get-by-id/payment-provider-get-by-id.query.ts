import { Query } from '@nestjs/cqrs';
import { type PaymentProviderGetByIdDto } from './payment-provider-get-by-id.dto';
import type { PaymentProviderResponseDto } from '@/application/dtos';

export class PaymentProviderGetByIdQuery extends Query<PaymentProviderResponseDto> {
	constructor(public readonly dto: PaymentProviderGetByIdDto) {
		super();
	}
}
