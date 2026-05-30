import { Controller, Get, Patch, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/presentation/middleware/jwt-auth.guard';
import { CurrentUser } from '@/presentation/decorators/current-user.decorator';
import { NotificationGetListQuery } from '@/application/queries';
import {
  MarkNotificationReadCommand,
  MarkAllNotificationsReadCommand,
  NotificationSoftDeleteCommand,
} from '@/application/commands';
import { NotificationDto, NotificationFilterDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get currently logged-in user's notifications" })
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query() filters: NotificationFilterDto,
  ): Promise<PaginatedResponseDto<NotificationDto>> {
    filters.recipientId = userId;
    return this.queryBus.execute(new NotificationGetListQuery(filters));
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark all notifications for the current user as read' })
  async readAll(@CurrentUser('sub') userId: string): Promise<void> {
    return this.commandBus.execute(new MarkAllNotificationsReadCommand(userId));
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark a single notification as read' })
  async markRead(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.commandBus.execute(new MarkNotificationReadCommand(id, userId));
  }

  @Patch(':id/soft-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete / dismiss a notification' })
  async softDelete(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.commandBus.execute(new NotificationSoftDeleteCommand(id, userId));
  }
}
