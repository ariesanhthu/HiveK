import { NotificationRoot } from '../../aggregate-roots/notification.aggregate';
import { IBaseRepository } from '../../common';

export type INotificationRepository = IBaseRepository<NotificationRoot>;

export const NOTIFICATION_REPOSITORY = Symbol('INotificationRepository');
