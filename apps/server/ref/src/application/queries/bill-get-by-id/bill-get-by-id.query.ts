import { Query } from '@nestjs/cqrs';
import { type BillGetByIdDto } from './bill-get-by-id.dto';
import type { BillResponseDto } from '@/application/dtos';

export class BillGetByIdQuery extends Query<BillResponseDto> {
	constructor(public readonly dto: BillGetByIdDto) {
		super();
	}
}
