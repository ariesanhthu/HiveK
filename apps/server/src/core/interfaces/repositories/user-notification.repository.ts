import { IBaseRepository } from '../../common';
import { UserNotificationRoot } from '../../aggregate-roots/user-notification.aggregate';

export interface IUserNotificationRepository extends IBaseRepository<UserNotificationRoot> {
  saveMany(userNotifications: UserNotificationRoot[]): Promise<void>;
  markAllRead(recipientId: string): Promise<void>;
}

export const USER_NOTIFICATION_REPOSITORY = Symbol('IUserNotificationRepository');
