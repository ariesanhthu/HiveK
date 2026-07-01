import { Query } from '@nestjs/cqrs';
import { type SubscriptionGetHistoryByIdDto } from './subscription-get-history-by-id.dto';
import type { SubscriptionHistoryResponseDTO } from '@/application/dtos';

export class SubscriptionGetHistoryByIdQuery extends Query<SubscriptionHistoryResponseDTO> {
	constructor(public readonly dto: SubscriptionGetHistoryByIdDto) {
		super();
	}
}
