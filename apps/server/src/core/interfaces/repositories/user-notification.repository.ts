import { IBaseRepository } from '../../common';
import { UserNotificationRoot } from '../../aggregate-roots/user-notification.aggregate';

export interface IUserNotificationRepository extends IBaseRepository<UserNotificationRoot> {
  saveMany(userNotifications: UserNotificationRoot[]): Promise<void>;
  markAll(recipientId: string, isRead: boolean): Promise<void>;
  updateReadStatus(ids: string[], recipientId: string, isRead: boolean): Promise<void>;
  softDeleteMany(ids: string[], recipientId: string, deletedBy: string): Promise<void>;
  restoreMany(ids: string[], recipientId: string): Promise<void>;
  hardDeleteMany(ids: string[], recipientId: string): Promise<void>;
}

export const USER_NOTIFICATION_REPOSITORY = Symbol('IUserNotificationRepository');
