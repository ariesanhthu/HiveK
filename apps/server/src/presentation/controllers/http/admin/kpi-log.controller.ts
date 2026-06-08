import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { KpiLogDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { KpiLogGetListQuery, KpiLogFilterDto } from '@/application/queries';
import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';
import { ERoleType } from '@/core/enums/role-type.enum';
import { Roles } from '@/presentation/decorators/roles.decorator';

@ApiTags('ADMIN-analytics')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ERoleType.ADMIN)
@Controller('admin/analytics/kpi-logs')
export class KpiLogAdminController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get paginated KPI logs' })
  async findAll(@Query() filters: KpiLogFilterDto): Promise<PaginatedResponseDto<KpiLogDto>> {
    return this.queryBus.execute(new KpiLogGetListQuery(filters));
  }
}
