import { UserUpdateCommandHandler } from '@/application/commands/user-update/user-update.handler';
import { UserUpdateCommand } from '@/application/commands/user-update/user-update.command';
import { UserNotFoundException } from '@/core/exceptions';
import { EnterpriseUserRoot } from '@/core/aggregate-roots';
import { ERoleType } from '@/core/enums';

describe('UserUpdateCommandHandler', () => {
  let handler: UserUpdateCommandHandler;
  let mockUserRepository: any;
  let mockAuthService: any;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockAuthService = {
      hashPassword: jest.fn(() => Promise.resolve('hashed')),
    };
    handler = new UserUpdateCommandHandler(mockUserRepository, mockAuthService);
  });

  it('should successfully update user properties', async () => {
    const mockUser = {
      id: 'user-123',
      props: {
        fullName: 'Old Name',
        phone: '123',
        updatedAt: new Date(),
      },
    };
    mockUserRepository.findById.mockResolvedValue(mockUser);

    const command = new UserUpdateCommand('user-123', {
      fullName: 'New Name',
      phone: '456',
    });

    await handler.execute(command);
    expect(mockUser.props.fullName).toBe('New Name');
    expect(mockUser.props.phone).toBe('456');
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
  });

  it('should successfully update enterpriseIds for enterprise user', async () => {
    const mockUser = EnterpriseUserRoot.create({
        email: 'ent@test.com',
        phone: '123',
        passwordHash: 'hash',
        fullName: 'Ent User',
        type: ERoleType.ENTERPRISE,
        roleId: 'role-ent',
        isEmailVerified: true,
    });
    mockUser.setId('user-123');
    mockUserRepository.findById.mockResolvedValue(mockUser);

    const command = new UserUpdateCommand('user-123', {
      enterpriseIds: ['ent-1', 'ent-2'],
    });

    await handler.execute(command);
    expect(mockUser.enterpriseIds).toEqual(['ent-1', 'ent-2']);
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
  });

  it('should throw NotFoundException if user is not found', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    const command = new UserUpdateCommand('user-123', {
      fullName: 'New Name',
    });

    await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
  });
});
