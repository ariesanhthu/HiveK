import { Query } from '@nestjs/cqrs';
import { type SubscriptionGetListDto } from './subscription-get-list.dto';
import type { SubscriptionResponseDTO } from '@/application/dtos';
import type { PaginationCursorResponseDto } from '@/shared/dtos';

export class SubscriptionGetListQuery extends Query<
	PaginationCursorResponseDto<SubscriptionResponseDTO>
> {
	constructor(public readonly dto: SubscriptionGetListDto) {
		super();
	}
}
