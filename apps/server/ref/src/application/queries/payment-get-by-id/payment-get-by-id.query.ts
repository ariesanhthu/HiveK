import { Query } from '@nestjs/cqrs';
import { type PaymentGetByIdDto } from './payment-get-by-id.dto';
import type { PaymentDetailResponseDto } from '@/application/dtos/payment.response.dto';

export class PaymentGetByIdQuery extends Query<PaymentDetailResponseDto> {
	constructor(public readonly dto: PaymentGetByIdDto) {
		super();
	}
}
