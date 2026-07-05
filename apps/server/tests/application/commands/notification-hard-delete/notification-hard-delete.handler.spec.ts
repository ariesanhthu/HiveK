import { NotificationHardDeleteCommandHandler } from '@/application/commands/notification-hard-delete/notification-hard-delete.handler';
import { NotificationHardDeleteCommand } from '@/application/commands/notification-hard-delete/notification-hard-delete.command';

describe('NotificationHardDeleteCommandHandler', () => {
  let handler: NotificationHardDeleteCommandHandler;
  let mockUserNotificationRepository: any;

  beforeEach(() => {
    mockUserNotificationRepository = {
      hardDeleteMany: jest.fn(),
    };
    handler = new NotificationHardDeleteCommandHandler(mockUserNotificationRepository);
  });

  it('should successfully hard delete notifications', async () => {
    const ids = ['notif-1', 'notif-2'];
    const userId = 'user-123';
    const command = new NotificationHardDeleteCommand(ids, userId);

    await handler.execute(command);

    expect(mockUserNotificationRepository.hardDeleteMany).toHaveBeenCalledWith(ids, userId);
  });
});
