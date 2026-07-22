import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiSecurity } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';
import { Roles, ApiOkResponseEnvelope, ApiPaginatedResponseEnvelope } from '@/presentation/decorators';
import { ERoleType } from '@/core/enums';
import { SubscriptionResponseDto, SubscriptionFilterDto, SubscriptionHistoryFilterDto, SubscriptionHistoryResponseDto } from '@/application/dtos';
import { SubscriptionGetListQuery, SubscriptionGetByIdQuery, SubscriptionHistoryGetListQuery } from '@/application/queries';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { buildVersionedRoute } from '@/presentation/utils';

@ApiTags('ADMIN-subscriptions')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(buildVersionedRoute('admin', 'subscriptions', 1))
export class SubscriptionAdminController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @Roles(ERoleType.ADMIN)
  @ApiOperation({ summary: 'Get all subscriptions' })
  @ApiPaginatedResponseEnvelope(SubscriptionResponseDto)
  async getAllSubscriptions(
    @Query() filter: SubscriptionFilterDto,
  ): Promise<PaginatedResponseDto<SubscriptionResponseDto>> {
    return this.queryBus.execute(new SubscriptionGetListQuery(filter));
  }

  @Get(':id')
  @Roles(ERoleType.ADMIN)
  @ApiOperation({ summary: 'Get a subscription by ID' })
  @ApiOkResponseEnvelope(SubscriptionResponseDto)
  async getSubscriptionById(@Param('id') id: string): Promise<SubscriptionResponseDto> {
    return this.queryBus.execute(new SubscriptionGetByIdQuery(id));
  }

  @Get(':id/history')
  @Roles(ERoleType.ADMIN)
  @ApiOperation({ summary: 'Get history for a subscription' })
  @ApiPaginatedResponseEnvelope(SubscriptionHistoryResponseDto)
  async getSubscriptionHistory(
    @Param('id') id: string,
    @Query() filter: SubscriptionHistoryFilterDto,
  ): Promise<PaginatedResponseDto<SubscriptionHistoryResponseDto>> {
    filter.subscriptionId = id;
    return this.queryBus.execute(new SubscriptionHistoryGetListQuery(filter));
  }
}

