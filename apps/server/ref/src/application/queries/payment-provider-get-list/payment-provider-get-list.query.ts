import { Query } from '@nestjs/cqrs';
import { type PaymentProviderGetListDto } from './payment-provider-get-list.dto';
import type { PaymentProviderResponseDto } from '@/application/dtos';
import type { PaginationCursorResponseDto } from '@/shared/dtos';

export class PaymentProviderGetListQuery extends Query<
	PaginationCursorResponseDto<PaymentProviderResponseDto>
> {
	constructor(public readonly dto: PaymentProviderGetListDto) {
		super();
	}
}
