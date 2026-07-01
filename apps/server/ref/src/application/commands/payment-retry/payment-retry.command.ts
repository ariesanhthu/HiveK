import { Command } from '@nestjs/cqrs';
import { type PaymentRetryDto } from './payment-retry.dto';

export type PaymentRetryResult = { paymentUrl?: string };

export class PaymentRetryCommand extends Command<PaymentRetryResult> {
	constructor(public readonly dto: PaymentRetryDto) {
		super();
	}
}
