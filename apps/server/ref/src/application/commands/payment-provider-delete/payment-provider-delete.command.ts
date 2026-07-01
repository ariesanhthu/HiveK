import { Command } from '@nestjs/cqrs';
import { type PaymentProviderDeleteDto } from './payment-provider-delete.dto';
import type { PaymentProviderDeleteResponseDto } from './payment-provider-delete.dto';

export class PaymentProviderDeleteCommand extends Command<PaymentProviderDeleteResponseDto> {
	constructor(public readonly dto: PaymentProviderDeleteDto) {
		super();
	}
}
