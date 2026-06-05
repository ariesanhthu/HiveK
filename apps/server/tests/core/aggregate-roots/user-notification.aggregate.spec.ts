import { UserNotificationRoot, UserNotificationCreateProps } from '@core/aggregate-roots/user-notification.aggregate';

describe('UserNotificationRoot Aggregate Root', () => {
  const defaultCreateProps: UserNotificationCreateProps = {
    notificationId: 'notif-123',
    recipientId: 'user-456',
  };

  describe('create', () => {
    it('should create with unread status and null timestamps', () => {
      const un = UserNotificationRoot.create(defaultCreateProps);

      expect(un).toBeDefined();
      expect(un.notificationId).toBe('notif-123');
      expect(un.recipientId).toBe('user-456');
      expect(un.isRead).toBe(false);
      expect(un.readAt).toBeNull();
      expect(un.deleteAt).toBeNull();
      expect(un.deleteBy).toBeNull();
      expect(un.createdAt).toBeInstanceOf(Date);
      expect(un.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('instantiate', () => {
    it('should restore existing user-notification with id', () => {
      const now = new Date();
      const un = UserNotificationRoot.instantiate('un-1', {
        notificationId: 'notif-123',
        recipientId: 'user-456',
        isRead: true,
        readAt: now,
        deleteAt: null,
        deleteBy: null,
        createdAt: now,
        updatedAt: now,
      });

      expect(un.id).toBe('un-1');
      expect(un.isRead).toBe(true);
      expect(un.readAt).toEqual(now);
    });
  });

  describe('markAsRead', () => {
    it('should mark as read and set readAt timestamp', () => {
      const un = UserNotificationRoot.create(defaultCreateProps);
      expect(un.isRead).toBe(false);

      un.markAsRead();

      expect(un.isRead).toBe(true);
      expect(un.readAt).toBeInstanceOf(Date);
    });

    it('should be idempotent when already read', () => {
      const un = UserNotificationRoot.create(defaultCreateProps);
      un.markAsRead();
      const readAt = un.readAt;

      un.markAsRead();

      expect(un.isRead).toBe(true);
      expect(un.readAt).toBe(readAt);
    });
  });

  describe('softDelete & restore', () => {
    it('should soft delete with deletor info', () => {
      const un = UserNotificationRoot.create(defaultCreateProps);
      un.softDelete('system');

      expect(un.deleteAt).toBeInstanceOf(Date);
      expect(un.deleteBy).toBe('system');
    });

    it('should restore after soft delete', () => {
      const un = UserNotificationRoot.create(defaultCreateProps);
      un.softDelete('system');
      expect(un.deleteAt).not.toBeNull();

      un.restore();

      expect(un.deleteAt).toBeNull();
      expect(un.deleteBy).toBeNull();
    });
  });
});