import { Query } from '@nestjs/cqrs';
import { CursorPaginationRequestDto } from '@/shared/dtos/pagination.dto';

export class GetKolProfileHandlesDevQuery extends Query<any> {
  constructor(public readonly pagination: CursorPaginationRequestDto) {
    super();
  }
}
