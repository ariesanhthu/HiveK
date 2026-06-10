import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MongoUserRepository } from '@/infrastructure/mongo/repositories/user.repository';
import { UserModel } from '@/infrastructure/mongo/schemas/user.schema';
import { ERoleType } from '@/core/enums';
import { KOLUserRoot, AdminRoot, EnterpriseUserRoot } from '@/core/aggregate-roots';
import { Types } from 'mongoose';
import { UNIT_OF_WORK } from '@/application/interfaces';

describe('MongoUserRepository', () => {
  let repository: MongoUserRepository;
  let mockUserModel: any;
  let mockUow: any;

  const validId = new Types.ObjectId().toString();
  const mockUserDoc = {
    _id: new Types.ObjectId(),
    email: 'test@example.com',
    phone: '+841234567890',
    password_hash: 'hashed',
    full_name: 'Test User',
    type: ERoleType.KOL,
    role_id: new Types.ObjectId(),
    is_email_verified: true,
    get: jest.fn().mockReturnValue(new Date()),
    delete_at: null,
    delete_by: null,
    refresh_token: null,
    google_id: null,
  };

  beforeEach(async () => {
    mockUserModel = {
      findById: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      find: jest.fn().mockReturnThis(),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      findByIdAndDelete: jest.fn().mockReturnThis(),
      session: jest.fn().mockReturnThis(),
      exec: jest.fn(),
      save: jest.fn(),
    };
    mockUserModel.constructor = jest.fn().mockImplementation((data) => {
        return {
            ...data,
            save: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
        };
    });

    mockUow = {
        getSession: jest.fn().mockReturnValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MongoUserRepository,
        {
          provide: getModelToken(UserModel.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(ERoleType.ADMIN),
          useValue: mockUserModel,
        },
        {
          provide: UNIT_OF_WORK,
          useValue: mockUow,
        },
      ],
    }).compile();

    repository = module.get<MongoUserRepository>(MongoUserRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('findById returns KOL user when found', async () => {
    mockUserModel.exec.mockResolvedValue(mockUserDoc);

    const result = await repository.findById(validId);

    expect(result).toBeInstanceOf(KOLUserRoot);
    expect(result?.email).toBe(mockUserDoc.email);
  });

  it('findById returns Enterprise user when found', async () => {
    const entDoc = { ...mockUserDoc, type: ERoleType.ENTERPRISE, enterprise_ids: [] };
    mockUserModel.exec.mockResolvedValue(entDoc);

    const result = await repository.findById(validId);

    expect(result).toBeInstanceOf(EnterpriseUserRoot);
  });

  it('findByEmail returns null when not found', async () => {
    mockUserModel.exec.mockResolvedValue(null);

    const result = await repository.findByEmail('none@test.com');

    expect(result).toBeNull();
  });

  it('findByIds returns users', async () => {
    mockUserModel.exec.mockResolvedValue([mockUserDoc]);
    const result = await repository.findByIds([validId]);
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(KOLUserRoot);
  });

  it('findByEnterpriseId returns users', async () => {
    mockUserModel.exec.mockResolvedValue([mockUserDoc]);
    const result = await repository.findByEnterpriseId(validId);
    expect(result).toHaveLength(1);
  });

  it('existsByRoleId returns boolean', async () => {
    mockUserModel.lean = jest.fn().mockReturnThis();
    mockUserModel.exec.mockResolvedValue({ _id: 'some-id' });
    const result = await repository.existsByRoleId(validId);
    expect(result).toBe(true);
  });

  it('save updates existing user', async () => {
    const user = KOLUserRoot.instantiate(new Types.ObjectId().toString(), {
      email: 'test@test.com',
      phone: { value: '+84123456789' } as any,
      passwordHash: 'hash',
      fullName: 'Name',
      type: ERoleType.KOL,
      roleId: new Types.ObjectId().toString(),
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deleteAt: null,
      deleteBy: null,
    });

    await repository.save(user);
    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  it('delete deletes user', async () => {
    await repository.delete(validId);
    expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(validId);
  });
});
