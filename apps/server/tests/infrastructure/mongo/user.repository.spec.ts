import { Model, Types } from 'mongoose';
import { MongoUserRepository } from '@/infrastructure/mongo/repositories/user.repository';
import { AdminRoot, EnterpriseUserRoot, KOLUserRoot } from '@/core/aggregate-roots';
import { ERoleType } from '@/core/enums';

// Mock Types.ObjectId to simply return the passed string (or a dummy value)
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

describe('MongoUserRepository', () => {
  let repo: MongoUserRepository;
  // `mockModel` acts both as a constructor (new this.userModel(data)) and as a collection of static query methods.
  // Using a jest.fn() allows it to be called with `new` while we manually attach the static methods.
  let mockModel: any;

  const adminDoc = {
    _id: new Types.ObjectId('admin-id'),
    email: 'admin@example.com',
    phone: '123456',
    password_hash: 'hash',
    full_name: 'Admin User',
    avatar: null,
    type: ERoleType.ADMIN,
    role_id: new Types.ObjectId('role-id'),
    is_email_verified: true,
    delete_at: null,
    delete_by: null,
    refresh_token: null,
    google_id: null,
    get: (field: string) => null,
  } as any;

  beforeEach(() => {
    // Initialise the mock as a callable constructor.
    mockModel = jest.fn();
    // Attach static query methods that return the mock itself for chaining.
    mockModel.findById = jest.fn().mockReturnThis();
    mockModel.findOne = jest.fn().mockReturnThis();
    mockModel.findByIdAndUpdate = jest.fn().mockReturnThis();
    mockModel.findByIdAndDelete = jest.fn().mockReturnThis();
    mockModel.exec = jest.fn();

    repo = new MongoUserRepository(mockModel as any);
  });

  it('findById returns AdminRoot when document type is ADMIN', async () => {
    (mockModel.exec as jest.Mock).mockResolvedValueOnce(adminDoc);
    const result = await repo.findById('admin-id');
    expect(mockModel.findById).toHaveBeenCalledWith('admin-id');
    expect(result).toBeInstanceOf(AdminRoot);
    expect(result?.email).toBe('admin@example.com');
  });

  it('findByEmail returns null when not found', async () => {
    (mockModel.exec as jest.Mock).mockResolvedValueOnce(null);
    const result = await repo.findByEmail('missing@example.com');
    expect(mockModel.findOne).toHaveBeenCalledWith({ email: 'missing@example.com' });
    expect(result).toBeNull();
  });

  it('save creates a new user when id is undefined', async () => {
    const newUser = AdminRoot.instantiate('', {
      email: 'new@example.com',
      phone: '111',
      passwordHash: 'hash',
      fullName: 'New Admin',
      avatar: undefined,
      type: ERoleType.ADMIN,
      roleId: 'role-id',
      isEmailVerified: false,
      createdAt: undefined,
      updatedAt: undefined,
      deleteAt: null,
      deleteBy: null,
      refreshToken: null,
      googleId: null,
    } as any);

    // mock the constructor returned object
    const saveMock = jest.fn().mockResolvedValue({ _id: new Types.ObjectId('generated-id') });
    // When the repository does `new this.userModel(data)`, return an object with a `save` method.
    mockModel.mockImplementation(() => ({ save: saveMock }));

    await repo.save(newUser);
    expect(saveMock).toHaveBeenCalled();
    expect(newUser.id).toBe('generated-id');
  });

  it('save updates an existing user when id is present', async () => {
    const existing = KOLUserRoot.instantiate('kol-id', {
      email: 'kol@example.com',
      phone: '222',
      passwordHash: 'hash',
      fullName: 'Kol User',
      avatar: undefined,
      type: ERoleType.KOL,
      roleId: 'role-id',
      isEmailVerified: true,
      createdAt: undefined,
      updatedAt: undefined,
      deleteAt: null,
      deleteBy: null,
      refreshToken: null,
      googleId: null,
    } as any);

    (mockModel.exec as jest.Mock).mockResolvedValueOnce(undefined);
    await repo.save(existing);
    expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith('kol-id', expect.any(Object), { upsert: true });
  });

  it('delete calls findByIdAndDelete with the given id', async () => {
    (mockModel.exec as jest.Mock).mockResolvedValueOnce(undefined);
    await repo.delete('some-id');
    expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('some-id');
  });
});
