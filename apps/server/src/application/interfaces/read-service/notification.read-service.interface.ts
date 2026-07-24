import { NotificationDto, NotificationFilterDto } from '@/application/dtos';
import { IBaseReadService } from './base.read-service.interface';

export const NOTIFICATION_READ_SERVICE = Symbol('NOTIFICATION_READ_SERVICE');

export type INotificationReadService = IBaseReadService<
  NotificationDto,
  NotificationFilterDto
>;
