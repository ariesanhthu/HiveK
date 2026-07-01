import { Command } from '@nestjs/cqrs';
import { type BillCreateDto } from './bill-create.dto';
import type { BillResponseDto } from '@/application/dtos';

export class BillCreateCommand extends Command<BillResponseDto> {
	constructor(public readonly dto: BillCreateDto) {
		super();
	}
}
