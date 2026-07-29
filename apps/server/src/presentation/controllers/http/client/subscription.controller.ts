import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiSecurity,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';
import {
  CurrentUser,
  Roles,
  ApiOkResponseEnvelope,
  ApiPaginatedResponseEnvelope,
} from '@/presentation/decorators';
import { ERoleType } from '@/core/enums';
import type { IJwtPayload } from '@/application/interfaces';
import {
  SubscriptionResponseDto,
  SubscriptionHistoryFilterDto,
  SubscriptionHistoryResponseDto,
} from '@/application/dtos';
import {
  SubscriptionGetByUserIdQuery,
  SubscriptionHistoryGetListQuery,
} from '@/application/queries';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { buildVersionedRoute } from '@/presentation/utils';

@ApiTags('CLIENT-subscriptions')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(buildVersionedRoute('client', 'subscriptions', 1))
export class SubscriptionClientController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('me')
  @Roles(ERoleType.ENTERPRISE)
  @ApiOperation({ summary: 'Get current user subscription' })
  @ApiOkResponseEnvelope(SubscriptionResponseDto)
  async getMySubscription(
    @CurrentUser() user: IJwtPayload,
  ): Promise<SubscriptionResponseDto> {
    return this.queryBus.execute(new SubscriptionGetByUserIdQuery(user.sub));
  }

  @Get('history/me')
  @Roles(ERoleType.ENTERPRISE)
  @ApiOperation({ summary: 'Get current user subscription history' })
  @ApiPaginatedResponseEnvelope(SubscriptionHistoryResponseDto)
  async getMySubscriptionHistory(
    @CurrentUser() user: IJwtPayload,
    @Query() filter: SubscriptionHistoryFilterDto,
  ): Promise<PaginatedResponseDto<SubscriptionHistoryResponseDto>> {
    filter.userId = user.sub;
    return this.queryBus.execute(new SubscriptionHistoryGetListQuery(filter));
  }
}
