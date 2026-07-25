// Enterprise schema loading triggers SchemaFactory.createForClass which breaks with mongoose mock
jest.mock('@/infrastructure/mongo/schemas/enterprise.schema', () => ({}));

// Keep real Types.ObjectId to avoid SchemaFactory.createForClass validation failures
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    Types: {
      ...actual.Types,
      ObjectId: actual.Types.ObjectId,
    },
  };
});

import { Types } from 'mongoose';
import { MongoUserNotificationRepository } from '@/infrastructure/mongo/repositories/user-notification.repository';
import { UserNotificationRoot } from '@/core/aggregate-roots';

describe('MongoUserNotificationRepository', () => {
  let repo: MongoUserNotificationRepository;
  let mockModel: any;
  let mockUow: any;

  const userNotificationDoc = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439017'),
    notification_id: new Types.ObjectId('507f1f77bcf86cd799439018'),
    recipient_id: new Types.ObjectId('507f1f77bcf86cd799439019'),
    is_read: false,
    read_at: null,
    delete_at: null,
    delete_by: null,
    created_at: new Date(),
    updated_at: new Date(),
  } as any;

  const mockCacheService = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
    delByPattern: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    mockModel = jest.fn();
    mockModel.findById = jest.fn().mockReturnThis();
    mockModel.findByIdAndUpdate = jest.fn().mockReturnThis();
    mockModel.findByIdAndDelete = jest.fn().mockReturnThis();
    mockModel.insertMany = jest.fn();
    mockModel.updateMany = jest.fn().mockReturnThis();
    mockModel.deleteMany = jest.fn().mockReturnThis();
    mockModel.session = jest.fn().mockReturnThis();
    mockModel.exec = jest.fn();

    mockUow = {
      getSession: jest.fn().mockReturnValue(null),
    };

    repo = new MongoUserNotificationRepository(mockModel as any, mockUow, mockCacheService as any);
  });

  describe('findById', () => {
    it('should return UserNotificationRoot when document is found', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(userNotificationDoc);

      const result = await repo.findById('507f1f77bcf86cd799439017');

      expect(mockModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439017');
      expect(result).toBeInstanceOf(UserNotificationRoot);
      expect(result?.id).toBe('507f1f77bcf86cd799439017');
      expect(result?.recipientId).toBe('507f1f77bcf86cd799439019');
    });
  });

  describe('save', () => {
    it('should create new document when id is undefined', async () => {
      const root = UserNotificationRoot.create({
        notificationId: '507f1f77bcf86cd799439018',
        recipientId: '507f1f77bcf86cd799439019',
      });

      const saveMock = jest.fn().mockResolvedValue({ _id: new Types.ObjectId('507f1f77bcf86cd79943901a') });
      mockModel.mockImplementation(() => ({ save: saveMock }));

      await repo.save(root);

      expect(saveMock).toHaveBeenCalled();
      expect(root.id).toBe('507f1f77bcf86cd79943901a');
    });
  });

  describe('saveMany', () => {
    it('should insert many documents', async () => {
      const root = UserNotificationRoot.create({
        notificationId: '507f1f77bcf86cd799439018',
        recipientId: '507f1f77bcf86cd799439019',
      });

      mockModel.insertMany.mockResolvedValueOnce([{ _id: new Types.ObjectId('507f1f77bcf86cd79943901b') }]);

      await repo.saveMany([root]);

      expect(mockModel.insertMany).toHaveBeenCalled();
      expect(root.id).toBe('507f1f77bcf86cd79943901b');
    });
  });

  describe('markAll', () => {
    it('should update many to read', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce({});
      await repo.markAll('507f1f77bcf86cd799439019', true);
      expect(mockModel.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ recipient_id: expect.anything(), is_read: false }),
        expect.objectContaining({ $set: expect.objectContaining({ is_read: true }) })
      );
    });
  });

  describe('updateReadStatus', () => {
    it('should update read status for specific ids', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce({});
      await repo.updateReadStatus(['507f1f77bcf86cd79943901d'], '507f1f77bcf86cd799439019', true);
      expect(mockModel.updateMany).toHaveBeenCalled();
    });
  });

  describe('softDeleteMany', () => {
    it('should soft delete many', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce({});
      await repo.softDeleteMany(['507f1f77bcf86cd79943901d'], '507f1f77bcf86cd799439019', 'admin-1');
      expect(mockModel.updateMany).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ $set: expect.objectContaining({ delete_by: 'admin-1' }) })
      );
    });
  });

  describe('restoreMany', () => {
    it('should restore many', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce({});
      await repo.restoreMany(['507f1f77bcf86cd79943901d'], '507f1f77bcf86cd799439019');
      expect(mockModel.updateMany).toHaveBeenCalled();
    });
  });

  describe('hardDeleteMany', () => {
    it('should hard delete many', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce({});
      await repo.hardDeleteMany(['507f1f77bcf86cd79943901d'], '507f1f77bcf86cd799439019');
      expect(mockModel.deleteMany).toHaveBeenCalled();
    });
  });
});
