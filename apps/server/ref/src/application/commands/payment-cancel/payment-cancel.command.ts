import { Command } from '@nestjs/cqrs';
import { type PaymentCancelDto } from './payment-cancel.dto';

export class PaymentCancelCommand extends Command<void> {
	constructor(public readonly dto: PaymentCancelDto) {
		super();
	}
}
