import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EmailNotificationHandler } from '@/application/events/notification-dispatched/email-notification.handler';
import { NotificationDispatchedEvent } from '@/application/events/notification-dispatched/notification-dispatched.event';
import { MAILER_SERVICE } from '@/application/interfaces/mailer.interface';
import { LOGGER_SERVICE } from '@/application/interfaces/logger.interface';
import { NotificationChannel, NotificationType } from '@/core/enums';

describe('EmailNotificationHandler', () => {
  let handler: EmailNotificationHandler;
  let mockUserModel: any;
  let mockMailerService: any;
  let mockLogger: any;

  beforeEach(async () => {
    mockUserModel = {
      find: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        { _id: 'user-1', email: 'alice@example.com', full_name: 'Alice Smith' },
        { _id: 'user-2', email: 'bob@example.com', full_name: 'Bob Jones' },
      ]),
    };

    mockMailerService = {
      sendMail: jest.fn().mockResolvedValue({}),
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
        EmailNotificationHandler,
        {
          provide: getModelToken('UserModel'),
          useValue: mockUserModel,
        },
        {
          provide: MAILER_SERVICE,
          useValue: mockMailerService,
        },
        {
          provide: LOGGER_SERVICE,
          useValue: mockLogger,
        },
      ],
    }).compile();

    handler = module.get<EmailNotificationHandler>(EmailNotificationHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
    expect(mockLogger.setContext).toHaveBeenCalledWith(EmailNotificationHandler.name);
  });

  it('should ignore event if email channel is missing', async () => {
    const event = new NotificationDispatchedEvent(
      {
        type: NotificationType.INFO,
        title: 'Email alert',
        content: 'Check email',
      },
      ['user-1'],
      [NotificationChannel.IN_APP] // in_app only
    );

    await handler.handle(event);

    expect(mockUserModel.find).not.toHaveBeenCalled();
    expect(mockMailerService.sendMail).not.toHaveBeenCalled();
  });

  it('should query active users and call mailerService for each', async () => {
    const event = new NotificationDispatchedEvent(
      {
        type: NotificationType.INFO,
        title: 'New Campaign Launch',
        content: 'Check the new details',
      },
      ['user-1', 'user-2'],
      [NotificationChannel.EMAIL]
    );

    await handler.handle(event);

    // Verify DB Query
    expect(mockUserModel.find).toHaveBeenCalledWith({
      _id: { $in: ['user-1', 'user-2'] },
      delete_at: null,
    });

    // Verify Mail Dispatch
    expect(mockMailerService.sendMail).toHaveBeenCalledTimes(2);
    expect(mockMailerService.sendMail).toHaveBeenNthCalledWith(1, {
      to: 'alice@example.com',
      subject: 'New Campaign Launch',
      template: 'test',
      context: {
        name: 'Alice Smith',
        message: 'Check the new details',
      },
      text: 'Check the new details',
    });
    expect(mockMailerService.sendMail).toHaveBeenNthCalledWith(2, {
      to: 'bob@example.com',
      subject: 'New Campaign Launch',
      template: 'test',
      context: {
        name: 'Bob Jones',
        message: 'Check the new details',
      },
      text: 'Check the new details',
    });
  });

  it('should tolerate mail dispatch errors and not interrupt looping', async () => {
    const event = new NotificationDispatchedEvent(
      {
        type: NotificationType.INFO,
        title: 'Campaign Update',
        content: 'Important change',
      },
      ['user-1', 'user-2'],
      [NotificationChannel.EMAIL]
    );

    // Make the first email send fail
    mockMailerService.sendMail
      .mockRejectedValueOnce(new Error('SMTP connection timed out'))
      .mockResolvedValueOnce({});

    // Should resolve without throwing
    await expect(handler.handle(event)).resolves.not.toThrow();

    expect(mockMailerService.sendMail).toHaveBeenCalledTimes(2);
    expect(mockLogger.error).toHaveBeenCalledWith(
      `Failed to send notification email to alice@example.com: SMTP connection timed out`
    );
  });
});
