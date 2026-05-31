import { NotificationSoftDeleteCommandHandler } from '@/application/commands/notification-soft-delete/notification-soft-delete.handler';
import { NotificationSoftDeleteCommand } from '@/application/commands/notification-soft-delete/notification-soft-delete.command';
import { UserNotificationRoot } from '@/core/aggregate-roots';
import { NotificationNotFoundException, NotificationForbiddenException } from '@/core/exceptions';

describe('NotificationSoftDeleteCommandHandler', () => {
  let handler: NotificationSoftDeleteCommandHandler;
  let mockUserNotificationRepository: any;

  beforeEach(() => {
    mockUserNotificationRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new NotificationSoftDeleteCommandHandler(mockUserNotificationRepository);
  });

  it('should soft delete notification successfully', async () => {
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

    const command = new NotificationSoftDeleteCommand('receipt-123', 'user-123');
    await handler.execute(command);

    expect(mockReceipt.deleteAt).toBeDefined();
    expect(mockReceipt.deleteBy).toBe('user-123');
    expect(mockUserNotificationRepository.save).toHaveBeenCalledWith(mockReceipt);
  });

  it('should throw NotFoundException if receipt does not exist', async () => {
    mockUserNotificationRepository.findById.mockResolvedValue(null);

    const command = new NotificationSoftDeleteCommand('receipt-none', 'user-123');
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

    const command = new NotificationSoftDeleteCommand('receipt-123', 'user-123');
    await expect(handler.execute(command)).rejects.toThrow(NotificationForbiddenException);
  });
});
