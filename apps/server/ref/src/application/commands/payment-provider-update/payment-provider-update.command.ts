import { Command } from '@nestjs/cqrs';
import { type PaymentProviderUpdateDto } from './payment-provider-update.dto';
import type { PaymentProviderResponseDto } from '@/application/dtos';

export class PaymentProviderUpdateCommand extends Command<PaymentProviderResponseDto> {
	constructor(public readonly dto: PaymentProviderUpdateDto) {
		super();
	}
}
