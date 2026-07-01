import { Query } from '@nestjs/cqrs';
import { type BillGetListDto } from './bill-get-list.dto';
import type { BillResponseDto } from '@/application/dtos';
import type { PaginationCursorResponseDto } from '@/shared/dtos';

export class BillGetListQuery extends Query<PaginationCursorResponseDto<BillResponseDto>> {
	constructor(public readonly dto: BillGetListDto) {
		super();
	}
}
