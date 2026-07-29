import { Query } from '@nestjs/cqrs';
import { BillGetListInputDto } from './bill-get-list.dto';
import { BillResponseDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

export class BillGetListQuery extends Query<
  PaginatedResponseDto<BillResponseDto>
> {
  constructor(public readonly input: BillGetListInputDto) {
    super();
  }
}
