import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';
import { Roles } from '@/presentation/decorators/roles.decorator';
import { ERoleType } from '@/core/enums';
import { CurrentUser } from '@/presentation/decorators/current-user.decorator';
import type { IJwtPayload } from '@/application/interfaces';
import { QuotaUsageResponseDto, EnterpriseQuotaAllocationResponseDto } from '@/application/dtos';
import { QuotaUsageGetByEnterpriseIdQuery, EnterpriseQuotaAllocationGetByOwnerIdQuery } from '@/application/queries';
import { buildVersionedRoute } from '@/presentation/utils';

@ApiTags('CLIENT-quotas')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(buildVersionedRoute('client', 'quotas', 1))
export class QuotaClientController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('usage/me')
  @Roles(ERoleType.ENTERPRISE)
  @ApiOperation({ summary: 'Get current enterprise quota usage' })
  @ApiResponse({ status: 200, type: QuotaUsageResponseDto })
  async getMyQuotaUsage(@CurrentUser() user: IJwtPayload): Promise<QuotaUsageResponseDto> {
    return this.queryBus.execute(new QuotaUsageGetByEnterpriseIdQuery(user.enterpriseId as string));
  }

  @Get('allocations/me')
  @Roles(ERoleType.ENTERPRISE)
  @ApiOperation({ summary: 'Get current enterprise quota allocations' })
  @ApiResponse({ status: 200, type: EnterpriseQuotaAllocationResponseDto })
  async getMyQuotaAllocations(@CurrentUser() user: IJwtPayload): Promise<EnterpriseQuotaAllocationResponseDto> {
    return this.queryBus.execute(new EnterpriseQuotaAllocationGetByOwnerIdQuery(user.enterpriseId as string));
  }
}
