import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { KpiLogDto, KpiLogFilterDto } from '@/application/analytics/dtos/kpi-log.dto';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';
import { GetKpiLogsQuery } from '@/application/analytics/queries/get-kpi-logs.handler';

@ApiTags('analytics')
@Controller('analytics/kpi-logs')
export class KpiLogController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated KPI logs' })
  async findAll(@Query() filters: KpiLogFilterDto): Promise<PaginatedResponseDto<KpiLogDto>> {
    return this.queryBus.execute(new GetKpiLogsQuery(filters));
  }
}
