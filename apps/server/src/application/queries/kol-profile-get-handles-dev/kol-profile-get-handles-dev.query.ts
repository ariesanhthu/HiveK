import { CursorPaginationRequestDto } from '@/application/dtos/pagination.dto';
import { Query } from '@nestjs/cqrs';

export class KolProfileGetHandlesDevQuery extends Query<any> {
  constructor(public readonly pagination: CursorPaginationRequestDto) {
    super();
  }
}
