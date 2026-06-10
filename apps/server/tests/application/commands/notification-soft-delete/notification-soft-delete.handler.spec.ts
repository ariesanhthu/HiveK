import { NotificationSoftDeleteCommandHandler } from '@/application/commands/notification-soft-delete/notification-soft-delete.handler';
import { NotificationSoftDeleteCommand } from '@/application/commands/notification-soft-delete/notification-soft-delete.command';

describe('NotificationSoftDeleteCommandHandler', () => {
  let handler: NotificationSoftDeleteCommandHandler;
  let mockUserNotificationRepository: any;

  beforeEach(() => {
    mockUserNotificationRepository = {
      softDeleteMany: jest.fn(),
    };
    handler = new NotificationSoftDeleteCommandHandler(mockUserNotificationRepository);
  });

  it('should trigger softDeleteMany repository method', async () => {
    const command = new NotificationSoftDeleteCommand(['receipt-123'], 'user-123');
    await handler.execute(command);

    expect(mockUserNotificationRepository.softDeleteMany).toHaveBeenCalledWith(['receipt-123'], 'user-123', 'user-123');
  });
});
