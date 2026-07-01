import { Query } from '@nestjs/cqrs';
import { type PaymentGetListDto } from './payment-get-list.dto';
import type { PaymentResponseDto } from '@/application/dtos/payment.response.dto';
import type { PaginationCursorResponseDto } from '@/shared/dtos';

export class PaymentGetListQuery extends Query<PaginationCursorResponseDto<PaymentResponseDto>> {
	constructor(public readonly dto: PaymentGetListDto) {
		super();
	}
}
