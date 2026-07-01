import { Query } from '@nestjs/cqrs';
import { type PaymentGetByBillIdDto } from './payment-get-by-bill-id.dto';
import type { PaymentResponseDto } from '@/application/dtos/payment.response.dto';

export class PaymentGetByBillIdQuery extends Query<PaymentResponseDto> {
	constructor(public readonly dto: PaymentGetByBillIdDto) {
		super();
	}
}
