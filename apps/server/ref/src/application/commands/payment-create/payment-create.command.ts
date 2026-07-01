import { Command } from '@nestjs/cqrs';
import { type PaymentCreateDto } from './payment-create.dto';
import type { PaymentCreateResponseDto } from './payment-create.dto';

export class PaymentCreateCommand extends Command<PaymentCreateResponseDto> {
	constructor(public readonly dto: PaymentCreateDto) {
		super();
	}
}
