import { UserUpdateCommand } from '@/application/commands/user-update/user-update.command';
import { UserUpdateCommandHandler } from '@/application/commands/user-update/user-update.handler';
import { KOLUserRoot } from '@/core/aggregate-roots';
import { ERoleType } from '@/core/enums';
import { UserNotFoundException } from '@/core/exceptions';
import { PhoneNumberVO } from '@/core/value-objects/phone-number.value-object';

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
    const mockUser = KOLUserRoot.instantiate('user-123', {
      email: 'test@example.com',
      phone: PhoneNumberVO.create({ value: '+84123456789' }),
      passwordHash: 'hash',
      fullName: 'Old Name',
      type: ERoleType.KOL,
      roleId: 'role-1',
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deleteAt: null,
      deleteBy: null,
      refreshToken: null,
      googleId: null,
    } as any);
    mockUserRepository.findById.mockResolvedValue(mockUser);

    const command = new UserUpdateCommand('user-123', {
      fullName: 'New Name',
      phone: '+84456789012',
    });

    await handler.execute(command);
    expect(mockUser.fullName).toBe('New Name');
    expect(mockUser.phone.value).toBe('+84456789012');
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
