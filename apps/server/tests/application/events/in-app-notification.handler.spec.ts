import { Test, TestingModule } from '@nestjs/testing';
import { InAppNotificationHandler } from '@/application/events/notification-dispatched/in-app-notification.handler';
import { NotificationDispatchedEvent } from '@/application/events/notification-dispatched/notification-dispatched.event';
import { NOTIFICATION_REPOSITORY, USER_NOTIFICATION_REPOSITORY } from '@/core/interfaces/repositories';
import { NotificationType, NotificationChannel } from '@/core/enums';
import { UNIT_OF_WORK } from '@/application/interfaces';

describe('InAppNotificationHandler', () => {
  let handler: InAppNotificationHandler;
  let mockNotificationRepo: any;
  let mockUserNotificationRepo: any;
  let mockUow: any;

  beforeEach(async () => {
    mockNotificationRepo = {
      save: jest.fn(),
    };
    mockUserNotificationRepo = {
      saveMany: jest.fn(),
    };
    mockUow = {
        execute: jest.fn((fn: any) => fn()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InAppNotificationHandler,
        {
          provide: NOTIFICATION_REPOSITORY,
          useValue: mockNotificationRepo,
        },
        {
          provide: USER_NOTIFICATION_REPOSITORY,
          useValue: mockUserNotificationRepo,
        },
        {
          provide: UNIT_OF_WORK,
          useValue: mockUow,
        },
      ],
    }).compile();

    handler = module.get<InAppNotificationHandler>(InAppNotificationHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should ignore event if in_app channel is missing', async () => {
    const event = new NotificationDispatchedEvent(
      { type: NotificationType.SYSTEM, title: 'T', content: 'C' },
      ['u1'],
      [NotificationChannel.EMAIL]
    );

    await handler.handle(event);

    expect(mockNotificationRepo.save).not.toHaveBeenCalled();
  });

  it('should create notification and user receipts', async () => {
    const event = new NotificationDispatchedEvent(
      { type: NotificationType.SYSTEM, title: 'T', content: 'C' },
      ['u1', 'u2'],
      [NotificationChannel.IN_APP]
    );

    mockNotificationRepo.save.mockImplementation(async (noti: any) => {
      noti.setId('noti-123');
    });

    await handler.handle(event);

    expect(mockNotificationRepo.save).toHaveBeenCalled();
    expect(mockUserNotificationRepo.saveMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ props: expect.objectContaining({ recipientId: 'u1', notificationId: 'noti-123' }) }),
        expect.objectContaining({ props: expect.objectContaining({ recipientId: 'u2', notificationId: 'noti-123' }) }),
      ])
    );
  });
});
