import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { NOTIFICATION_READ_SERVICE, type INotificationReadService } from '@/application/interfaces';
import { NotificationGetListQuery } from './notification-get-list.query';
import { NotificationDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';

@QueryHandler(NotificationGetListQuery)
export class NotificationGetListQueryHandler implements IQueryHandler<NotificationGetListQuery, PaginatedResponseDto<NotificationDto>> {
  constructor(
    @Inject(NOTIFICATION_READ_SERVICE)
    private readonly notificationReadService: INotificationReadService,
  ) {}

  async execute(query: NotificationGetListQuery): Promise<PaginatedResponseDto<NotificationDto>> {
    return this.notificationReadService.findAll(query.filters);
  }
}
