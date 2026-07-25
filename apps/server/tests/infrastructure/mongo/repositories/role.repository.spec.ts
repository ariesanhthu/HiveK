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
import { MongoRoleRepository } from '@/infrastructure/mongo/repositories/role.repository';
import { RoleRoot } from '@/core/aggregate-roots';
import { ERoleType } from '@/core/enums';

describe('MongoRoleRepository', () => {
  let repo: MongoRoleRepository;
  let mockModel: any;
  let mockUow: any;

  const roleDoc = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    title: 'Admin',
    permissions: ['read', 'write'],
    type: ERoleType.ADMIN,
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
    mockModel.find = jest.fn().mockReturnThis();
    mockModel.findOne = jest.fn().mockReturnThis();
    mockModel.findByIdAndUpdate = jest.fn().mockReturnThis();
    mockModel.findByIdAndDelete = jest.fn().mockReturnThis();
    mockModel.session = jest.fn().mockReturnThis();
    mockModel.exec = jest.fn();

    mockUow = {
      getSession: jest.fn().mockReturnValue(null),
    };

    repo = new MongoRoleRepository(mockModel as any, mockUow, mockCacheService as any);
  });

  describe('findById', () => {
    it('should return RoleRoot when document is found', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(roleDoc);

      const result = await repo.findById('507f1f77bcf86cd799439011');

      expect(mockModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toBeInstanceOf(RoleRoot);
      expect(result?.id).toBe('507f1f77bcf86cd799439011');
      expect(result?.title).toBe('Admin');
    });
  });

  describe('findByTitle', () => {
    it('should return RoleRoot when document is found by title', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(roleDoc);

      const result = await repo.findByTitle('Admin');

      expect(mockModel.findOne).toHaveBeenCalledWith({ title: 'Admin' });
      expect(result?.title).toBe('Admin');
    });
  });

  describe('save', () => {
    it('should create new role document when id is undefined', async () => {
      const role = RoleRoot.create({
        title: 'Manager',
        permissions: ['read'],
        type: ERoleType.ENTERPRISE_ADMIN,
      });

      const saveMock = jest.fn().mockResolvedValue({ _id: new Types.ObjectId('507f1f77bcf86cd799439012') });
      mockModel.mockImplementation(() => ({ save: saveMock }));

      await repo.save(role);

      expect(saveMock).toHaveBeenCalled();
      expect(role.id).toBe('507f1f77bcf86cd799439012');
    });

    it('should update existing role document when id is present', async () => {
      const role = RoleRoot.instantiate('507f1f77bcf86cd799439011', {
        title: 'Admin Updated',
        permissions: ['*'],
        type: ERoleType.ADMIN,
        deleteAt: null,
        deleteBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (mockModel.exec as jest.Mock).mockResolvedValueOnce(undefined);

      await repo.save(role);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        expect.objectContaining({
          title: 'Admin Updated',
        }),
        { upsert: true }
      );
    });
  });
});
