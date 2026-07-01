import { Command } from '@nestjs/cqrs';
import { type BillCancelDto } from './bill-cancel.dto';

export class BillCancelCommand extends Command<void> {
	constructor(public readonly dto: BillCancelDto) {
		super();
	}
}
