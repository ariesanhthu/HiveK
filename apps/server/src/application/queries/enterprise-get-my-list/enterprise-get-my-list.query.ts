import { Query } from '@nestjs/cqrs';
import { EnterpriseFilterDto } from '@/application/queries/enterprise-get-list/enterprise-get-list.dto';
import { EnterpriseDetailDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

export class EnterpriseGetMyListQuery extends Query<PaginatedResponseDto<EnterpriseDetailDto>> {
  constructor(
    public readonly userId: string,
    public readonly filters?: EnterpriseFilterDto,
  ) {
    super();
  }
}