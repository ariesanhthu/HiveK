import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';
import { Roles } from '@/presentation/decorators/roles.decorator';
import { ERoleType } from '@/core/enums';
import { CurrentUser } from '@/presentation/decorators/current-user.decorator';
import type { IJwtPayload } from '@/application/interfaces';
import { SubscriptionResponseDto, SubscriptionHistoryFilterDto, SubscriptionHistoryResponseDto } from '@/application/dtos';
import { SubscriptionGetByUserIdQuery, SubscriptionHistoryGetListQuery } from '@/application/queries';
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
  @ApiResponse({ status: 200, type: SubscriptionResponseDto })
  async getMySubscription(@CurrentUser() user: IJwtPayload): Promise<SubscriptionResponseDto> {
    return this.queryBus.execute(new SubscriptionGetByUserIdQuery(user.sub as string));
  }

  @Get('history/me')
  @Roles(ERoleType.ENTERPRISE)
  @ApiOperation({ summary: 'Get current user subscription history' })
  @ApiResponse({ status: 200 })
  async getMySubscriptionHistory(
    @CurrentUser() user: IJwtPayload,
    @Query() filter: SubscriptionHistoryFilterDto,
  ): Promise<PaginatedResponseDto<SubscriptionHistoryResponseDto>> {
    filter.userId = user.sub as string;
    return this.queryBus.execute(new SubscriptionHistoryGetListQuery(filter));
  }
}
