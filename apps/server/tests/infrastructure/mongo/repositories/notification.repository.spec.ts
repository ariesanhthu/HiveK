import { UNIT_OF_WORK } from '@/application/interfaces';
import { NotificationRoot } from '@/core/aggregate-roots';
import { NotificationType, TargetType } from '@/core/enums';
import { MongoNotificationRepository } from '@/infrastructure/mongo/repositories/notification.repository';
import { NotificationModel } from '@/infrastructure/mongo/schemas/notification.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

describe('MongoNotificationRepository', () => {
  let repository: MongoNotificationRepository;
  let mockNotificationModel: any;
  let mockUow: any;

  const mockNotificationDoc = {
    _id: new Types.ObjectId(),
    type: NotificationType.SYSTEM,
    title: 'Test Notification',
    content: 'Content',
    target_type: TargetType.ALL,
    target_id: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    mockNotificationModel = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
    }));

    mockNotificationModel.findById = jest.fn().mockReturnThis();
    mockNotificationModel.findByIdAndUpdate = jest.fn().mockReturnThis();
    mockNotificationModel.findByIdAndDelete = jest.fn().mockReturnThis();
    mockNotificationModel.session = jest.fn().mockReturnThis();
    mockNotificationModel.exec = jest.fn();

    mockUow = {
      getSession: jest.fn().mockReturnValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MongoNotificationRepository,
        {
          provide: getModelToken(NotificationModel.name),
          useValue: mockNotificationModel,
        },
        {
          provide: UNIT_OF_WORK,
          useValue: mockUow,
        },
      ],
    }).compile();

    repository = module.get<MongoNotificationRepository>(MongoNotificationRepository);
  });

  it('findById returns notification when found', async () => {
    mockNotificationModel.exec.mockResolvedValue(mockNotificationDoc);

    const result = await repository.findById(new Types.ObjectId().toHexString());

    expect(result).toBeInstanceOf(NotificationRoot);
    expect(result?.title).toBe(mockNotificationDoc.title);
  });

  it('save inserts new notification', async () => {
    const notification = NotificationRoot.create({
      type: NotificationType.SYSTEM,
      title: 'New Notification',
      content: 'Content',
      targetType: TargetType.ALL,
      targetId: null,
    });

    await repository.save(notification);

    expect(notification.id).toBeDefined();
    expect(mockNotificationModel).toHaveBeenCalled();
  });
});
