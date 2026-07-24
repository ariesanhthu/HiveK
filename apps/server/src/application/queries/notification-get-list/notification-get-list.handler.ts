import { NotificationDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { type INotificationReadService, NOTIFICATION_READ_SERVICE } from '@/application/interfaces';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotificationGetListQuery } from './notification-get-list.query';

@QueryHandler(NotificationGetListQuery)
export class NotificationGetListQueryHandler implements
  IQueryHandler<
    NotificationGetListQuery,
    PaginatedResponseDto<NotificationDto>
  >
{
  constructor(
    @Inject(NOTIFICATION_READ_SERVICE) private readonly notificationReadService:
      INotificationReadService,
  ) {}

  async execute(
    query: NotificationGetListQuery,
  ): Promise<PaginatedResponseDto<NotificationDto>> {
    return this.notificationReadService.findAll(query.filters);
  }
}
