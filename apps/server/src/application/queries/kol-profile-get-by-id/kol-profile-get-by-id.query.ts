import { Query } from '@nestjs/cqrs';
import { KolProfileDto } from '@/application/dtos';

export class KolProfileGetByIdQuery extends Query<KolProfileDto> {
  constructor(public readonly id: string) {
    super();
  }
}
