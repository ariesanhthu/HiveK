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

  it('should trigger hardDeleteMany repository method', async () => {
    const command = new NotificationHardDeleteCommand(['receipt-123'], 'user-123');
    await handler.execute(command);

    expect(mockUserNotificationRepository.hardDeleteMany).toHaveBeenCalledWith(['receipt-123'], 'user-123');
  });
});
