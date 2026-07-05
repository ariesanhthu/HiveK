import { NotificationRestoreCommandHandler } from '@/application/commands/notification-restore/notification-restore.handler';
import { NotificationRestoreCommand } from '@/application/commands/notification-restore/notification-restore.command';

describe('NotificationRestoreCommandHandler', () => {
  let handler: NotificationRestoreCommandHandler;
  let mockUserNotificationRepository: any;

  beforeEach(() => {
    mockUserNotificationRepository = {
      restoreMany: jest.fn(),
    };
    handler = new NotificationRestoreCommandHandler(mockUserNotificationRepository);
  });

  it('should successfully restore notifications', async () => {
    const ids = ['notif-1', 'notif-2'];
    const userId = 'user-123';
    const command = new NotificationRestoreCommand(ids, userId);

    await handler.execute(command);

    expect(mockUserNotificationRepository.restoreMany).toHaveBeenCalledWith(ids, userId);
  });
});
