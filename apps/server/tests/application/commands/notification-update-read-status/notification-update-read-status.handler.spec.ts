import { NotificationUpdateReadStatusCommand } from '@/application/commands/notification-update-read-status/notification-update-read-status.command';
import { NotificationUpdateReadStatusCommandHandler } from '@/application/commands/notification-update-read-status/notification-update-read-status.handler';

describe('NotificationUpdateReadStatusCommandHandler', () => {
  let handler: NotificationUpdateReadStatusCommandHandler;
  let mockUserNotificationRepository: any;

  beforeEach(() => {
    mockUserNotificationRepository = {
      updateReadStatus: jest.fn(),
      markAll: jest.fn(),
    };
    handler = new NotificationUpdateReadStatusCommandHandler(mockUserNotificationRepository);
  });

  it('should successfully update read status for specific notifications', async () => {
    const ids = ['notif-1', 'notif-2'];
    const userId = 'user-123';
    // Constructor: (userId: string, isRead: boolean, ids?: string[])
    const command = new NotificationUpdateReadStatusCommand(userId, true, ids);

    await handler.execute(command);

    expect(mockUserNotificationRepository.updateReadStatus).toHaveBeenCalledWith(ids, userId, true);
  });

  it('should mark all as read if no ids provided', async () => {
    const userId = 'user-123';
    // Constructor: (userId: string, isRead: boolean, ids?: string[])
    const command = new NotificationUpdateReadStatusCommand(userId, true, []);

    await handler.execute(command);

    expect(mockUserNotificationRepository.markAll).toHaveBeenCalledWith(userId, true);
  });
});
