import { EnterpriseDetailDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { ENTERPRISE_READ_SERVICE, type IEnterpriseReadService } from '@/application/interfaces';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EnterpriseGetListQuery } from './enterprise-get-list.query';

@QueryHandler(EnterpriseGetListQuery)
export class EnterpriseGetListHandler
  implements IQueryHandler<EnterpriseGetListQuery, PaginatedResponseDto<EnterpriseDetailDto>>
{
  constructor(
    @Inject(ENTERPRISE_READ_SERVICE) private readonly enterpriseReadService: IEnterpriseReadService,
  ) {}

  async execute(query: EnterpriseGetListQuery): Promise<PaginatedResponseDto<EnterpriseDetailDto>> {
    return this.enterpriseReadService.findAll(query.filters);
  }
}
