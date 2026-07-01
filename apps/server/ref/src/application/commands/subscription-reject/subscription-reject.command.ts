import { Command } from '@nestjs/cqrs';

export interface SubscriptionRejectDto {
	enterpriseId: string; // tenantId
	invalidPermissions: string[];
	occurredOn: string;
	name: string;
	topic: string;
}

export class SubscriptionRejectCommand extends Command<void> {
	constructor(public readonly dto: SubscriptionRejectDto) {
		super();
	}
}
