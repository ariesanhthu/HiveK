import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';
import { KpiLogDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { KpiLogGetListQuery, KpiLogFilterDto } from '@/application/queries';
import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';
import { ERoleType } from '@/core/enums/role-type.enum';
import { Roles, ApiPaginatedResponseEnvelope } from '@/presentation/decorators';

@ApiTags('ADMIN-analytics')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ERoleType.ADMIN)
@Controller(buildVersionedRoute('admin', 'analytics/kpi-logs', 1))
export class KpiLogAdminController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get paginated KPI logs' })
  @ApiPaginatedResponseEnvelope(KpiLogDto)
  async findAll(
    @Query() filters: KpiLogFilterDto,
  ): Promise<PaginatedResponseDto<KpiLogDto>> {
    return this.queryBus.execute(new KpiLogGetListQuery(filters));
  }
}
