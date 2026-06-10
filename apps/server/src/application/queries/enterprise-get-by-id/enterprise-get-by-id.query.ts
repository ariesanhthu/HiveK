import { Query } from '@nestjs/cqrs';
import { EnterpriseDetailDto } from '@/application/dtos';

export class EnterpriseGetByIdQuery extends Query<EnterpriseDetailDto> {
  constructor(public readonly id: string) {
    super();
  }
}
