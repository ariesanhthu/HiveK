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

  it('should trigger restoreMany repository method', async () => {
    const command = new NotificationRestoreCommand(['receipt-123'], 'user-123');
    await handler.execute(command);

    expect(mockUserNotificationRepository.restoreMany).toHaveBeenCalledWith(['receipt-123'], 'user-123');
  });
});
