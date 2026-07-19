import { NotificationRoot, NotificationCreateProps } from '@core/aggregate-roots/notification.aggregate';
import { NotificationType, ETargetType } from '@core/enums';

describe('NotificationRoot Aggregate Root', () => {
  const defaultCreateProps: NotificationCreateProps = {
    type: NotificationType.SYSTEM,
    title: 'Test Notification',
    content: 'This is a test notification content',
    targetType: null,
    targetId: null,
  };

  describe('create', () => {
    it('should create notification with all fields', () => {
      const notification = NotificationRoot.create(defaultCreateProps);

      expect(notification).toBeDefined();
      expect(notification.type).toBe(NotificationType.SYSTEM);
      expect(notification.title).toBe('Test Notification');
      expect(notification.content).toBe('This is a test notification content');
      expect(notification.targetType).toBeNull();
      expect(notification.targetId).toBeNull();
      expect(notification.createdAt).toBeInstanceOf(Date);
      expect(notification.updatedAt).toBeInstanceOf(Date);
    });

    it('should create notification with target info', () => {
      const props: NotificationCreateProps = {
        ...defaultCreateProps,
        targetType: ETargetType.CAMPAIGN,
        targetId: 'campaign-123',
      };
      const notification = NotificationRoot.create(props);

      expect(notification.targetType).toBe(ETargetType.CAMPAIGN);
      expect(notification.targetId).toBe('campaign-123');
    });
  });

  describe('instantiate', () => {
    it('should restore existing notification with id', () => {
      const now = new Date();
      const notification = NotificationRoot.instantiate('notif-123', {
        ...defaultCreateProps,
        createdAt: now,
        updatedAt: now,
      });

      expect(notification).toBeDefined();
      expect(notification.id).toBe('notif-123');
      expect(notification.title).toBe('Test Notification');
    });

    it('should throw error on double setId', () => {
      const now = new Date();
      const notification = NotificationRoot.instantiate('notif-123', {
        ...defaultCreateProps,
        createdAt: now,
        updatedAt: now,
      });
      expect(() => notification.setId('other-id')).toThrow('ID is already set');
    });
  });

  describe('equals', () => {
    it('should return true for same id', () => {
      const now = new Date();
      const n1 = NotificationRoot.instantiate('id-1', { ...defaultCreateProps, createdAt: now, updatedAt: now });
      const n2 = NotificationRoot.instantiate('id-1', { ...defaultCreateProps, createdAt: now, updatedAt: now });
      expect(n1.equals(n2)).toBe(true);
    });

    it('should return false for different ids', () => {
      const now = new Date();
      const n1 = NotificationRoot.instantiate('id-1', { ...defaultCreateProps, createdAt: now, updatedAt: now });
      const n2 = NotificationRoot.instantiate('id-2', { ...defaultCreateProps, createdAt: now, updatedAt: now });
      expect(n1.equals(n2)).toBe(false);
    });

    it('should return false for null/undefined', () => {
      const n = NotificationRoot.create(defaultCreateProps);
      expect(n.equals(null)).toBe(false);
      expect(n.equals(undefined)).toBe(false);
    });
  });

  describe('getters', () => {
    it('should return correct values from create props', () => {
      const notification = NotificationRoot.create(defaultCreateProps);
      expect(notification.type).toBe(NotificationType.SYSTEM);
      expect(notification.title).toBe('Test Notification');
      expect(notification.content).toBe('This is a test notification content');
      expect(notification.targetType).toBeNull();
      expect(notification.targetId).toBeNull();
    });
  });
});