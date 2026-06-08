import { Controller, Get, Patch, Delete, Param, Query, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';
import { JwtAuthGuard } from '@/presentation/middleware/guards/jwt-auth.guard';
import { CurrentUser } from '@/presentation/decorators/current-user.decorator';
import { NotificationGetListQuery } from '@/application/queries';
import {
  NotificationUpdateReadStatusCommand,
  NotificationSoftDeleteCommand,
  NotificationRestoreCommand,
  NotificationHardDeleteCommand,
  NotificationUpdateReadStatusDto,
  NotificationSoftDeleteDto,
  NotificationRestoreDto,
  NotificationHardDeleteDto,
} from '@/application/commands';
import {
  NotificationDto,
  NotificationFilterDto,
} from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

@ApiTags('CLIENT-notifications')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard)
@Controller(buildVersionedRoute('client', 'notifications', 1))
export class NotificationClientController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Get()
  @ApiOperation({ summary: "Get currently logged-in user's notifications" })
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query() filters: NotificationFilterDto,
  ): Promise<PaginatedResponseDto<NotificationDto>> {
    filters.recipientId = userId;
    return this.queryBus.execute(new NotificationGetListQuery(filters));
  }

  @Patch('read-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update read/unread status for notifications (all if ids is empty/null)' })
  async updateReadStatus(
    @CurrentUser('sub') userId: string,
    @Body() dto: NotificationUpdateReadStatusDto,
  ): Promise<void> {
    return this.commandBus.execute(new NotificationUpdateReadStatusCommand(userId, dto.isRead, dto.ids));
  }

  @Patch('soft-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete / dismiss a list of notifications' })
  async softDelete(
    @CurrentUser('sub') userId: string,
    @Body() dto: NotificationSoftDeleteDto,
  ): Promise<void> {
    return this.commandBus.execute(new NotificationSoftDeleteCommand(dto.ids, userId));
  }

  @Patch('restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a list of soft deleted notifications' })
  async restore(
    @CurrentUser('sub') userId: string,
    @Body() dto: NotificationRestoreDto,
  ): Promise<void> {
    return this.commandBus.execute(new NotificationRestoreCommand(dto.ids, userId));
  }

  @Delete('hard-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete a list of notifications' })
  async hardDelete(
    @CurrentUser('sub') userId: string,
    @Body() dto: NotificationHardDeleteDto,
  ): Promise<void> {
    return this.commandBus.execute(new NotificationHardDeleteCommand(dto.ids, userId));
  }
}
