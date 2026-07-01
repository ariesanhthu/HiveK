import { Command } from '@nestjs/cqrs';
import { type PaymentRefundDto } from './payment-refund.dto';

export class PaymentRefundCommand extends Command<void> {
	constructor(public readonly dto: PaymentRefundDto) {
		super();
	}
}
