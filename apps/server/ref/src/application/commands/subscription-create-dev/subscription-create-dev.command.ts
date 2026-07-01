import { Command } from '@nestjs/cqrs';
import { type BillCreateDto } from '../bill-create';

export class SubscriptionCreateDevCommand extends Command<void> {
	constructor(public readonly dto: BillCreateDto) {
		super();
	}
}
