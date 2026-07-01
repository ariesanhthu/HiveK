import { Query } from '@nestjs/cqrs';
import { type SubscriptionGetByEnterpriseDto } from './subscription-get-by-enterprise.dto';
import type { SubscriptionResponseDTO } from '@/application/dtos';

export class SubscriptionGetByEnterpriseQuery extends Query<SubscriptionResponseDTO> {
	constructor(public readonly dto: SubscriptionGetByEnterpriseDto) {
		super();
	}
}
