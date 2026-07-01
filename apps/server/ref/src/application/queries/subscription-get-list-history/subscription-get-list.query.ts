import { Query } from '@nestjs/cqrs';
import { type SubscriptionGetListHistoryDto } from './subscription-get-list-history.dto';
import type { SubscriptionHistoryResponseDTO } from '@/application/dtos';
import type { PaginationCursorResponseDto } from '@/shared/dtos';

export class SubscriptionGetListHistoryQuery extends Query<
	PaginationCursorResponseDto<SubscriptionHistoryResponseDTO>
> {
	constructor(public readonly dto: SubscriptionGetListHistoryDto) {
		super();
	}
}
