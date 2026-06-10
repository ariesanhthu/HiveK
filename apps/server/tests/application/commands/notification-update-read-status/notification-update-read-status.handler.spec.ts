import { NotificationUpdateReadStatusCommandHandler } from '@/application/commands/notification-update-read-status/notification-update-read-status.handler';
import { NotificationUpdateReadStatusCommand } from '@/application/commands/notification-update-read-status/notification-update-read-status.command';

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

  it('should trigger updateReadStatus repository method with isRead true when ids provided', async () => {
    const command = new NotificationUpdateReadStatusCommand('user-123', true, ['receipt-123']);
    await handler.execute(command);

    expect(mockUserNotificationRepository.updateReadStatus).toHaveBeenCalledWith(['receipt-123'], 'user-123', true);
  });

  it('should trigger markAll repository method when ids is empty', async () => {
    const command = new NotificationUpdateReadStatusCommand('user-123', true, []);
    await handler.execute(command);

    expect(mockUserNotificationRepository.markAll).toHaveBeenCalledWith('user-123', true);
  });

  it('should trigger markAll repository method when ids is null/undefined', async () => {
    const command = new NotificationUpdateReadStatusCommand('user-123', false);
    await handler.execute(command);

    expect(mockUserNotificationRepository.markAll).toHaveBeenCalledWith('user-123', false);
  });
});
