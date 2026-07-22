import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiSecurity } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';
import { Roles, ApiOkResponseEnvelope } from '@/presentation/decorators';
import { ERoleType } from '@/core/enums';
import { QuotaUsageResponseDto, EnterpriseQuotaAllocationResponseDto } from '@/application/dtos';
import { QuotaUsageGetByEnterpriseIdQuery, EnterpriseQuotaAllocationGetByOwnerIdQuery } from '@/application/queries';
import { buildVersionedRoute } from '@/presentation/utils';

@ApiTags('ADMIN-quotas')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(buildVersionedRoute('admin', 'quotas', 1))
export class QuotaAdminController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('usage/:enterpriseId')
  @Roles(ERoleType.ADMIN)
  @ApiOperation({ summary: 'Get quota usage for an enterprise' })
  @ApiOkResponseEnvelope(QuotaUsageResponseDto)
  async getQuotaUsageByEnterpriseId(@Param('enterpriseId') enterpriseId: string): Promise<QuotaUsageResponseDto> {
    return this.queryBus.execute(new QuotaUsageGetByEnterpriseIdQuery(enterpriseId));
  }

  @Get('allocations/:ownerId')
  @Roles(ERoleType.ADMIN)
  @ApiOperation({ summary: 'Get quota allocations for an enterprise' })
  @ApiOkResponseEnvelope(EnterpriseQuotaAllocationResponseDto)
  async getQuotaAllocationsByOwnerId(@Param('ownerId') ownerId: string): Promise<EnterpriseQuotaAllocationResponseDto> {
    return this.queryBus.execute(new EnterpriseQuotaAllocationGetByOwnerIdQuery(ownerId));
  }
}

