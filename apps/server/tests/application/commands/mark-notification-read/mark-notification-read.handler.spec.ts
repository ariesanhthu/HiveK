import { MarkNotificationReadCommandHandler } from '@/application/commands/mark-notification-read/mark-notification-read.handler';
import { MarkNotificationReadCommand } from '@/application/commands/mark-notification-read/mark-notification-read.command';
import { UserNotificationRoot } from '@/core/aggregate-roots';
import { NotificationNotFoundException, NotificationForbiddenException } from '@/core/exceptions';

describe('MarkNotificationReadCommandHandler', () => {
  let handler: MarkNotificationReadCommandHandler;
  let mockUserNotificationRepository: any;

  beforeEach(() => {
    mockUserNotificationRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new MarkNotificationReadCommandHandler(mockUserNotificationRepository);
  });

  it('should mark notification as read successfully', async () => {
    const mockReceipt = UserNotificationRoot.instantiate('receipt-123', {
      notificationId: 'noti-123',
      recipientId: 'user-123',
      isRead: false,
      readAt: null,
      deleteAt: null,
      deleteBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockUserNotificationRepository.findById.mockResolvedValue(mockReceipt);

    const command = new MarkNotificationReadCommand('receipt-123', 'user-123');
    await handler.execute(command);

    expect(mockReceipt.isRead).toBe(true);
    expect(mockReceipt.readAt).toBeDefined();
    expect(mockUserNotificationRepository.save).toHaveBeenCalledWith(mockReceipt);
  });

  it('should throw NotFoundException if receipt does not exist', async () => {
    mockUserNotificationRepository.findById.mockResolvedValue(null);

    const command = new MarkNotificationReadCommand('receipt-none', 'user-123');
    await expect(handler.execute(command)).rejects.toThrow(NotificationNotFoundException);
  });

  it('should throw ForbiddenException if receipt belongs to a different user', async () => {
    const mockReceipt = UserNotificationRoot.instantiate('receipt-123', {
      notificationId: 'noti-123',
      recipientId: 'other-user',
      isRead: false,
      readAt: null,
      deleteAt: null,
      deleteBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockUserNotificationRepository.findById.mockResolvedValue(mockReceipt);

    const command = new MarkNotificationReadCommand('receipt-123', 'user-123');
    await expect(handler.execute(command)).rejects.toThrow(NotificationForbiddenException);
  });
});
