import { MarkAllNotificationsReadCommandHandler } from '@/application/commands/mark-all-notifications-read/mark-all-notifications-read.handler';
import { MarkAllNotificationsReadCommand } from '@/application/commands/mark-all-notifications-read/mark-all-notifications-read.command';

describe('MarkAllNotificationsReadCommandHandler', () => {
  let handler: MarkAllNotificationsReadCommandHandler;
  let mockUserNotificationRepository: any;

  beforeEach(() => {
    mockUserNotificationRepository = {
      markAllRead: jest.fn(),
    };
    handler = new MarkAllNotificationsReadCommandHandler(mockUserNotificationRepository);
  });

  it('should trigger markAllRead repository method', async () => {
    const command = new MarkAllNotificationsReadCommand('user-123');
    await handler.execute(command);

    expect(mockUserNotificationRepository.markAllRead).toHaveBeenCalledWith('user-123');
  });
});
