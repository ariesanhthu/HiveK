import { EnterpriseDetailDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { EnterpriseFilterDto } from '@/application/queries/enterprise-get-list/enterprise-get-list.dto';
import { Query } from '@nestjs/cqrs';

export class EnterpriseGetListQuery extends Query<PaginatedResponseDto<EnterpriseDetailDto>> {
  constructor(public readonly filters?: EnterpriseFilterDto) {
    super();
  }
}
