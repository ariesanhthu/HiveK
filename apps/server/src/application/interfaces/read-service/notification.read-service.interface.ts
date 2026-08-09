import { IBaseReadService } from './base.read-service.interface';
import { NotificationDto, NotificationFilterDto } from '@/application/dtos';

export const NOTIFICATION_READ_SERVICE = Symbol('NOTIFICATION_READ_SERVICE');

export interface INotificationReadService extends IBaseReadService<
  NotificationDto,
  NotificationFilterDto
> {}
