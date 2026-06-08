import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';
import { KpiLogDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { KpiLogGetListQuery, KpiLogFilterDto } from '@/application/queries';
import { JwtAuthGuard } from '@/presentation/middleware/guards';

@ApiTags('CLIENT-analytics')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@Controller(buildVersionedRoute('client', 'analytics/kpi-logs', 1))
export class KpiLogClientController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get paginated KPI logs' })
  async findAll(@Query() filters: KpiLogFilterDto): Promise<PaginatedResponseDto<KpiLogDto>> {
    return this.queryBus.execute(new KpiLogGetListQuery(filters));
  }
}
