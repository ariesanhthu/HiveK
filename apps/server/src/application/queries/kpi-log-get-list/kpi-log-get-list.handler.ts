import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  KPI_LOG_READ_SERVICE,
  type IKpiLogReadService,
} from '@/application/interfaces';
import { KpiLogDto } from '@/application/dtos';
import { KpiLogGetListQuery } from './kpi-log-get-list.query';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

@QueryHandler(KpiLogGetListQuery)
export class KpiLogGetListHandler implements IQueryHandler<
  KpiLogGetListQuery,
  PaginatedResponseDto<KpiLogDto>
> {
  constructor(
    @Inject(KPI_LOG_READ_SERVICE)
    private readonly kpiLogReadService: IKpiLogReadService,
  ) {}

  async execute(
    query: KpiLogGetListQuery,
  ): Promise<PaginatedResponseDto<KpiLogDto>> {
    return this.kpiLogReadService.findAll(query.filters);
  }
}
