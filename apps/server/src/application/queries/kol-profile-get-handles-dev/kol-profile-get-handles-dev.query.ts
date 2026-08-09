import { Query } from '@nestjs/cqrs';
import { CursorPaginationRequestDto } from '@/application/dtos/pagination.dto';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

export class KolProfileGetHandlesDevQuery extends Query<
  PaginatedResponseDto<Record<string, unknown>>
> {
  constructor(public readonly pagination: CursorPaginationRequestDto) {
    super();
  }
}
