import { Types } from 'mongoose';
import { MongoRoleRepository } from '@/infrastructure/mongo/repositories/role.repository';
import { RoleRoot } from '@/core/aggregate-roots';
import { ERoleType } from '@/core/enums';

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

describe('MongoRoleRepository', () => {
  let repo: MongoRoleRepository;
  let mockModel: any;
  let mockUow: any;

  const roleDoc = {
    _id: new Types.ObjectId('role-123'),
    title: 'Admin',
    permissions: ['read', 'write'],
    type: ERoleType.ADMIN,
    delete_at: null,
    delete_by: null,
    created_at: new Date(),
    updated_at: new Date(),
  } as any;

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

    repo = new MongoRoleRepository(mockModel as any, mockUow);
  });

  describe('findById', () => {
    it('should return RoleRoot when document is found', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(roleDoc);

      const result = await repo.findById('role-123');

      expect(mockModel.findById).toHaveBeenCalledWith('role-123');
      expect(result).toBeInstanceOf(RoleRoot);
      expect(result?.id).toBe('role-123');
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

      const saveMock = jest.fn().mockResolvedValue({ _id: new Types.ObjectId('gen-role-id') });
      mockModel.mockImplementation(() => ({ save: saveMock }));

      await repo.save(role);

      expect(saveMock).toHaveBeenCalled();
      expect(role.id).toBe('gen-role-id');
    });

    it('should update existing role document when id is present', async () => {
      const role = RoleRoot.instantiate('role-123', {
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
        'role-123',
        expect.objectContaining({
          title: 'Admin Updated',
        }),
        { upsert: true }
      );
    });
  });
});
