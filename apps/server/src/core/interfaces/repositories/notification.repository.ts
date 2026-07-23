import { NotificationRoot } from '../../aggregate-roots/notification.aggregate';
import { IBaseRepository } from '../../common';

export interface INotificationRepository extends IBaseRepository<NotificationRoot> {}

export const NOTIFICATION_REPOSITORY = Symbol('INotificationRepository');
