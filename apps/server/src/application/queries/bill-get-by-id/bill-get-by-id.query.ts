import { Query } from '@nestjs/cqrs';
import { BillGetByIdInputDto } from './bill-get-by-id.dto';
import { BillResponseDto } from '@/application/dtos';

export class BillGetByIdQuery extends Query<BillResponseDto | null> {
  constructor(public readonly input: BillGetByIdInputDto) {
    super();
  }
}
