import { EnterpriseDetailDto } from '@/application/dtos';
import { Query } from '@nestjs/cqrs';

export class EnterpriseGetByIdQuery extends Query<EnterpriseDetailDto> {
  constructor(public readonly id: string) {
    super();
  }
}
