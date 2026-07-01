import { Command } from '@nestjs/cqrs';
import { type PaymentProviderCreateDto } from './payment-provider-create.dto';
import type { PaymentProviderResponseDto } from '@/application/dtos';

export class PaymentProviderCreateCommand extends Command<PaymentProviderResponseDto> {
	constructor(public readonly dto: PaymentProviderCreateDto) {
		super();
	}
}
