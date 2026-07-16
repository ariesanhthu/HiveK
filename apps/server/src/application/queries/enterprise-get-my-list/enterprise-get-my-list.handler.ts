import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ENTERPRISE_READ_SERVICE, type IEnterpriseReadService } from '@/application/interfaces';
import { EnterpriseDetailDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { EnterpriseGetMyListQuery } from './enterprise-get-my-list.query';

@QueryHandler(EnterpriseGetMyListQuery)
export class EnterpriseGetMyListHandler implements IQueryHandler<EnterpriseGetMyListQuery, PaginatedResponseDto<EnterpriseDetailDto>> {
  constructor(
    @Inject(ENTERPRISE_READ_SERVICE)
    private readonly enterpriseReadService: IEnterpriseReadService,
  ) {}

  async execute(query: EnterpriseGetMyListQuery): Promise<PaginatedResponseDto<EnterpriseDetailDto>> {
    return this.enterpriseReadService.findByUserIdOrMember(query.userId, query.filters);
  }
}