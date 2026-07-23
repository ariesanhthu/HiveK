import { NotificationSendCommand } from '@/application/commands/notification-send/notification-send.command';
import { NotificationSendCommandHandler } from '@/application/commands/notification-send/notification-send.handler';
import { NotificationDispatchedEvent } from '@/application/events';
import { ERoleType, NotificationChannel, NotificationType } from '@/core/enums';
import { EnterpriseNotFoundException, InvalidOperationException } from '@/core/exceptions';

describe('NotificationSendCommandHandler', () => {
  let handler: NotificationSendCommandHandler;
  let mockEventBus: any;
  let mockUserModel: any;
  let mockEnterpriseRepository: any;

  beforeEach(() => {
    mockEventBus = {
      publish: jest.fn(),
    };
    mockUserModel = {
      find: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };
    mockEnterpriseRepository = {
      findById: jest.fn(),
    };

    handler = new NotificationSendCommandHandler(
      mockEventBus as any,
      mockUserModel as any,
      mockEnterpriseRepository as any,
    );
  });

  it('should publish NotificationDispatchedEvent for direct broadcast successfully', async () => {
    const command = new NotificationSendCommand({
      type: NotificationType.SYSTEM,
      title: 'Direct Noti',
      content: 'This is direct',
      channels: [NotificationChannel.IN_APP],
      audience: {
        broadcastType: 'direct',
        userIds: ['user-123'],
      },
    });

    await handler.execute(command);

    expect(mockEventBus.publish).toHaveBeenCalledWith(
      expect.any(NotificationDispatchedEvent),
    );
    const event = mockEventBus.publish.mock.calls[0][0];
    expect(event.recipientIds).toEqual(['user-123']);
  });

  it('should throw BadRequestException if direct broadcast lacks userIds', async () => {
    const command = new NotificationSendCommand({
      type: NotificationType.SYSTEM,
      title: 'Direct Noti',
      content: 'This is direct',
      channels: [NotificationChannel.IN_APP],
      audience: {
        broadcastType: 'direct',
        userIds: [],
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(InvalidOperationException);
  });

  it('should publish Event for admin broadcast successfully', async () => {
    mockUserModel.exec.mockResolvedValue([{ _id: 'admin-1' }, { _id: 'admin-2' }]);

    const command = new NotificationSendCommand({
      type: NotificationType.SYSTEM,
      title: 'Admin Noti',
      content: 'This is admin',
      channels: [NotificationChannel.IN_APP],
      audience: {
        broadcastType: 'admin',
      },
    });

    await handler.execute(command);

    expect(mockUserModel.find).toHaveBeenCalledWith({ type: ERoleType.ADMIN, delete_at: null });
    expect(mockEventBus.publish).toHaveBeenCalled();
    const event = mockEventBus.publish.mock.calls[0][0];
    expect(event.recipientIds).toEqual(['admin-1', 'admin-2']);
  });

  it('should publish Event for enterprise broadcast successfully including owner', async () => {
    mockEnterpriseRepository.findById.mockResolvedValue({
      userId: 'owner-id',
    });
    mockUserModel.exec.mockResolvedValue([{ _id: 'member-1' }]);

    const command = new NotificationSendCommand({
      type: NotificationType.SYSTEM,
      title: 'Enterprise Noti',
      content: 'This is enterprise',
      channels: [NotificationChannel.IN_APP],
      audience: {
        broadcastType: 'enterprise',
        enterpriseId: 'enterprise-123',
      },
    });

    await handler.execute(command);

    expect(mockEnterpriseRepository.findById).toHaveBeenCalledWith('enterprise-123');
    expect(mockUserModel.find).toHaveBeenCalledWith({
      type: ERoleType.ENTERPRISE,
      enterprise_id: 'enterprise-123',
      delete_at: null,
    });
    const event = mockEventBus.publish.mock.calls[0][0];
    expect(event.recipientIds).toContain('member-1');
    expect(event.recipientIds).toContain('owner-id');
  });

  it('should throw NotFoundException if enterprise does not exist', async () => {
    mockEnterpriseRepository.findById.mockResolvedValue(null);

    const command = new NotificationSendCommand({
      type: NotificationType.SYSTEM,
      title: 'Enterprise Noti',
      content: 'This is enterprise',
      channels: [NotificationChannel.IN_APP],
      audience: {
        broadcastType: 'enterprise',
        enterpriseId: 'enterprise-not-found',
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(EnterpriseNotFoundException);
  });
});
