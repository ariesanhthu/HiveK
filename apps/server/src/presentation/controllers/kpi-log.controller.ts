import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { KpiLogDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';
import { KpiLogGetListQuery, KpiLogFilterDto } from '@/application/queries';
import { JwtAuthGuard } from '../middleware/guards';

@ApiTags('analytics')
@Controller('analytics/kpi-logs')
export class KpiLogController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get paginated KPI logs' })
  async findAll(@Query() filters: KpiLogFilterDto): Promise<PaginatedResponseDto<KpiLogDto>> {
    return this.queryBus.execute(new KpiLogGetListQuery(filters));
  }
}
