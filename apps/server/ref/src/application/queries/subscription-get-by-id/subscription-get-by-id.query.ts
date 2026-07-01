import { Query } from '@nestjs/cqrs';
import { type SubscriptionGetByIdDto } from './subscription-get-by-id.dto';
import type { SubscriptionResponseDTO } from '@/application/dtos';

export class SubscriptionGetByIdQuery extends Query<SubscriptionResponseDTO> {
	constructor(public readonly dto: SubscriptionGetByIdDto) {
		super();
	}
}
