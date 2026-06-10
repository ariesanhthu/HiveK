import { IBaseRepository } from '../../common';
import { NotificationRoot } from '../../aggregate-roots/notification.aggregate';

export interface INotificationRepository extends IBaseRepository<NotificationRoot> {}

export const NOTIFICATION_REPOSITORY = Symbol('INotificationRepository');
