import { Query } from '@nestjs/cqrs';
import { type PaymentEventGetByPaymentIdDto } from './payment-event-get-by-payment-id.dto';
import type { PaymentEventResponseDto } from '@/application/dtos';
import type { PaginationCursorResponseDto } from '@/shared/dtos';

export class PaymentEventGetByPaymentIdQuery extends Query<
	PaginationCursorResponseDto<PaymentEventResponseDto>
> {
	constructor(public readonly dto: PaymentEventGetByPaymentIdDto) {
		super();
	}
}
