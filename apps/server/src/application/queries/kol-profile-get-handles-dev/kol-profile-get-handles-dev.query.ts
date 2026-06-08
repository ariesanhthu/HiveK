import { Query } from '@nestjs/cqrs';
import { CursorPaginationRequestDto } from '@/application/dtos/pagination.dto';

export class KolProfileGetHandlesDevQuery extends Query<any> {
  constructor(public readonly pagination: CursorPaginationRequestDto) {
    super();
  }
}
