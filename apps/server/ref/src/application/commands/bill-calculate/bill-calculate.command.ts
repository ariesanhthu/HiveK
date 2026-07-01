import { Command } from '@nestjs/cqrs';
import { type BillCalculateDto } from './bill-calculate.dto';
import type { BillCalculateResponseDto } from './bill-calculate.response.dto';

export class BillCalculateCommand extends Command<BillCalculateResponseDto> {
	constructor(public readonly dto: BillCalculateDto) {
		super();
	}
}
