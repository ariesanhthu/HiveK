import { KpiLogDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { type IKpiLogReadService, KPI_LOG_READ_SERVICE } from '@/application/interfaces';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { KpiLogGetListQuery } from './kpi-log-get-list.query';

@QueryHandler(KpiLogGetListQuery)
export class KpiLogGetListHandler
  implements IQueryHandler<KpiLogGetListQuery, PaginatedResponseDto<KpiLogDto>>
{
  constructor(
    @Inject(KPI_LOG_READ_SERVICE) private readonly kpiLogReadService: IKpiLogReadService,
  ) {}

  async execute(query: KpiLogGetListQuery): Promise<PaginatedResponseDto<KpiLogDto>> {
    return this.kpiLogReadService.findAll(query.filters);
  }
}
