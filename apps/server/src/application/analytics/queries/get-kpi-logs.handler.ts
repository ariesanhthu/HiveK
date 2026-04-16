import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { KPI_LOG_READ_SERVICE, type IKpiLogReadService } from '@/application/interfaces';
import { KpiLogDto, KpiLogFilterDto } from '@/application/analytics/dtos/kpi-log.dto';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';

export class GetKpiLogsQuery extends Query<PaginatedResponseDto<KpiLogDto>> {
  constructor(public readonly filters?: KpiLogFilterDto) {
    super();
  }
}

@QueryHandler(GetKpiLogsQuery)
export class GetKpiLogsHandler implements IQueryHandler<GetKpiLogsQuery, PaginatedResponseDto<KpiLogDto>> {
  constructor(
    @Inject(KPI_LOG_READ_SERVICE)
    private readonly kpiLogReadService: IKpiLogReadService,
  ) {}

  async execute(query: GetKpiLogsQuery): Promise<PaginatedResponseDto<KpiLogDto>> {
    return this.kpiLogReadService.findAll(query.filters);
  }
}
