import { Query } from '@nestjs/cqrs';
import { EnterpriseDto } from '@/application/dtos';

export class EnterpriseGetByIdQuery extends Query<EnterpriseDto> {
  constructor(public readonly id: string) {
    super();
  }
}
