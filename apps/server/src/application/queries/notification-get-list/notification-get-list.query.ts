import { NotificationDto, NotificationFilterDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { Query } from '@nestjs/cqrs';

export class NotificationGetListQuery extends Query<PaginatedResponseDto<NotificationDto>> {
  constructor(public readonly filters: NotificationFilterDto) {
    super();
  }
}
