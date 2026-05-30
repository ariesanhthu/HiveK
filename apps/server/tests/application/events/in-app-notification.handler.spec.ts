import { Test, TestingModule } from '@nestjs/testing';
import { InAppNotificationHandler } from '@/application/events/notification-dispatched/in-app-notification.handler';
import { NotificationDispatchedEvent } from '@/application/events/notification-dispatched/notification-dispatched.event';
import { NOTIFICATION_REPOSITORY, USER_NOTIFICATION_REPOSITORY } from '@/core/interfaces/repositories';
import { WEBSOCKET_SERVICE } from '@/application/interfaces/web-socket.interface';
import { LOGGER_SERVICE } from '@/application/interfaces/logger.interface';
import { NotificationChannel, NotificationType, TargetType } from '@/core/enums';
import { NotificationRoot, UserNotificationRoot } from '@/core/aggregate-roots';

describe('InAppNotificationHandler', () => {
  let handler: InAppNotificationHandler;
  let mockNotificationRepository: any;
  let mockUserNotificationRepository: any;
  let mockWebSocketService: any;
  let mockLogger: any;

  beforeEach(async () => {
    mockNotificationRepository = {
      save: jest.fn().mockImplementation((notification: NotificationRoot) => {
        notification.setId('mock-notif-id');
        return Promise.resolve();
      }),
    };

    mockUserNotificationRepository = {
      saveMany: jest.fn().mockImplementation((userNotifications: UserNotificationRoot[]) => {
        userNotifications.forEach((un, idx) => {
          un.setId(`mock-user-notif-id-${idx}`);
        });
        return Promise.resolve();
      }),
    };

    mockWebSocketService = {
      emitToUser: jest.fn(),
    };

    mockLogger = {
      setContext: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InAppNotificationHandler,
        {
          provide: NOTIFICATION_REPOSITORY,
          useValue: mockNotificationRepository,
        },
        {
          provide: USER_NOTIFICATION_REPOSITORY,
          useValue: mockUserNotificationRepository,
        },
        {
          provide: WEBSOCKET_SERVICE,
          useValue: mockWebSocketService,
        },
        {
          provide: LOGGER_SERVICE,
          useValue: mockLogger,
        },
      ],
    }).compile();

    handler = module.get<InAppNotificationHandler>(InAppNotificationHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
    expect(mockLogger.setContext).toHaveBeenCalledWith(InAppNotificationHandler.name);
  });

  it('should ignore event if in_app channel is missing', async () => {
    const event = new NotificationDispatchedEvent(
      {
        type: NotificationType.INFO,
        title: 'Test Title',
        content: 'Test Content',
      },
      ['user-1'],
      [NotificationChannel.EMAIL] // Email only
    );

    await handler.handle(event);

    expect(mockNotificationRepository.save).not.toHaveBeenCalled();
    expect(mockUserNotificationRepository.saveMany).not.toHaveBeenCalled();
    expect(mockWebSocketService.emitToUser).not.toHaveBeenCalled();
  });

  it('should save notification receipts and push real-time WS events when in_app is present', async () => {
    const event = new NotificationDispatchedEvent(
      {
        type: NotificationType.INFO,
        title: 'Real-time alert',
        content: 'Check this out',
        targetType: TargetType.CAMPAIGN,
        targetId: 'campaign-123',
      },
      ['user-1', 'user-2'],
      [NotificationChannel.IN_APP]
    );

    await handler.handle(event);

    // Verify Notification save
    expect(mockNotificationRepository.save).toHaveBeenCalledTimes(1);
    const savedNotif = mockNotificationRepository.save.mock.calls[0][0] as NotificationRoot;
    expect(savedNotif.title).toBe('Real-time alert');
    expect(savedNotif.content).toBe('Check this out');
    expect(savedNotif.targetType).toBe(TargetType.CAMPAIGN);
    expect(savedNotif.targetId).toBe('campaign-123');

    // Verify UserNotification bulk save
    expect(mockUserNotificationRepository.saveMany).toHaveBeenCalledTimes(1);
    const savedUserNotifs = mockUserNotificationRepository.saveMany.mock.calls[0][0] as UserNotificationRoot[];
    expect(savedUserNotifs.length).toBe(2);
    expect(savedUserNotifs[0].recipientId).toBe('user-1');
    expect(savedUserNotifs[0].notificationId).toBe('mock-notif-id');
    expect(savedUserNotifs[1].recipientId).toBe('user-2');
    expect(savedUserNotifs[1].notificationId).toBe('mock-notif-id');

    // Verify WebSocket pushes
    expect(mockWebSocketService.emitToUser).toHaveBeenCalledTimes(2);
    expect(mockWebSocketService.emitToUser).toHaveBeenNthCalledWith(1, 'user-1', 'notification', {
      id: 'mock-user-notif-id-0',
      notificationId: 'mock-notif-id',
      title: 'Real-time alert',
      content: 'Check this out',
      type: NotificationType.INFO,
      targetType: TargetType.CAMPAIGN,
      targetId: 'campaign-123',
      isRead: false,
      createdAt: expect.any(Date),
    });
    expect(mockWebSocketService.emitToUser).toHaveBeenNthCalledWith(2, 'user-2', 'notification', {
      id: 'mock-user-notif-id-1',
      notificationId: 'mock-notif-id',
      title: 'Real-time alert',
      content: 'Check this out',
      type: NotificationType.INFO,
      targetType: TargetType.CAMPAIGN,
      targetId: 'campaign-123',
      isRead: false,
      createdAt: expect.any(Date),
    });
  });

  it('should catch websocket dispatch errors and not crash the handler', async () => {
    const event = new NotificationDispatchedEvent(
      {
        type: NotificationType.INFO,
        title: 'Error-tolerant push',
        content: 'Check error handling',
      },
      ['user-1'],
      [NotificationChannel.IN_APP]
    );

    mockWebSocketService.emitToUser.mockImplementation(() => {
      throw new Error('Connection lost');
    });

    // Should not throw
    await expect(handler.handle(event)).resolves.not.toThrow();

    expect(mockNotificationRepository.save).toHaveBeenCalledTimes(1);
    expect(mockUserNotificationRepository.saveMany).toHaveBeenCalledTimes(1);
    expect(mockWebSocketService.emitToUser).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(
      `Failed to send real-time websocket notification to user user-1: Connection lost`
    );
  });
});
