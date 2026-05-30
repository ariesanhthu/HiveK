import { Query } from '@nestjs/cqrs';
import { NotificationFilterDto, NotificationDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';

export class NotificationGetListQuery extends Query<PaginatedResponseDto<NotificationDto>> {
  constructor(public readonly filters: NotificationFilterDto) {
    super();
  }
}
