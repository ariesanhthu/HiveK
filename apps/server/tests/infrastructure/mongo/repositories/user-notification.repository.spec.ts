import { Types } from 'mongoose';
import { MongoUserNotificationRepository } from '@/infrastructure/mongo/repositories/user-notification.repository';
import { UserNotificationRoot } from '@/core/aggregate-roots';

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    Types: {
      ObjectId: jest.fn().mockImplementation((id: string) => ({
        toString: () => id,
      })),
    },
  };
});

describe('MongoUserNotificationRepository', () => {
  let repo: MongoUserNotificationRepository;
  let mockModel: any;
  let mockUow: any;

  const userNotificationDoc = {
    _id: new Types.ObjectId('un-123'),
    notification_id: new Types.ObjectId('notif-123'),
    recipient_id: new Types.ObjectId('user-123'),
    is_read: false,
    read_at: null,
    delete_at: null,
    delete_by: null,
    created_at: new Date(),
    updated_at: new Date(),
  } as any;

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

    repo = new MongoUserNotificationRepository(mockModel as any, mockUow);
  });

  describe('findById', () => {
    it('should return UserNotificationRoot when document is found', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(userNotificationDoc);

      const result = await repo.findById('un-123');

      expect(mockModel.findById).toHaveBeenCalledWith('un-123');
      expect(result).toBeInstanceOf(UserNotificationRoot);
      expect(result?.id).toBe('un-123');
      expect(result?.recipientId).toBe('user-123');
    });
  });

  describe('save', () => {
    it('should create new document when id is undefined', async () => {
      const root = UserNotificationRoot.create({
        notificationId: 'notif-123',
        recipientId: 'user-123',
      });

      const saveMock = jest.fn().mockResolvedValue({ _id: new Types.ObjectId('gen-un-id') });
      mockModel.mockImplementation(() => ({ save: saveMock }));

      await repo.save(root);

      expect(saveMock).toHaveBeenCalled();
      expect(root.id).toBe('gen-un-id');
    });
  });

  describe('saveMany', () => {
    it('should insert many documents', async () => {
      const root = UserNotificationRoot.create({
        notificationId: 'notif-123',
        recipientId: 'user-123',
      });

      mockModel.insertMany.mockResolvedValueOnce([{ _id: new Types.ObjectId('gen-id-1') }]);

      await repo.saveMany([root]);

      expect(mockModel.insertMany).toHaveBeenCalled();
      expect(root.id).toBe('gen-id-1');
    });
  });

  describe('markAll', () => {
    it('should update many to read', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce({});
      await repo.markAll('user-123', true);
      expect(mockModel.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ recipient_id: expect.anything(), is_read: false }),
        expect.objectContaining({ $set: expect.objectContaining({ is_read: true }) })
      );
    });
  });

  describe('updateReadStatus', () => {
    it('should update read status for specific ids', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce({});
      await repo.updateReadStatus(['id1'], 'user-123', true);
      expect(mockModel.updateMany).toHaveBeenCalled();
    });
  });

  describe('softDeleteMany', () => {
    it('should soft delete many', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce({});
      await repo.softDeleteMany(['id1'], 'user-123', 'admin-1');
      expect(mockModel.updateMany).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ $set: expect.objectContaining({ delete_by: 'admin-1' }) })
      );
    });
  });

  describe('restoreMany', () => {
    it('should restore many', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce({});
      await repo.restoreMany(['id1'], 'user-123');
      expect(mockModel.updateMany).toHaveBeenCalled();
    });
  });

  describe('hardDeleteMany', () => {
    it('should hard delete many', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce({});
      await repo.hardDeleteMany(['id1'], 'user-123');
      expect(mockModel.deleteMany).toHaveBeenCalled();
    });
  });
});
