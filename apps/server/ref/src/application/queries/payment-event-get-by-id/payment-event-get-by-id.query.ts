import { Query } from '@nestjs/cqrs';
import { type PaymentEventGetByIdDto } from './payment-event-get-by-id.dto';
import type { PaymentEventResponseDto } from '@/application/dtos';

export class PaymentEventGetByIdQuery extends Query<PaymentEventResponseDto> {
	constructor(public readonly dto: PaymentEventGetByIdDto) {
		super();
	}
}
