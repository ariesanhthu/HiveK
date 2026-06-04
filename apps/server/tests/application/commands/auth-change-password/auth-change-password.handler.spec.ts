import { AuthChangePasswordCommandHandler } from '@/application/commands/auth-change-password/auth-change-password.handler';
import { AuthChangePasswordCommand } from '@/application/commands/auth-change-password/auth-change-password.command';
import { UserNotFoundException } from '@/core/exceptions';

describe('AuthChangePasswordCommandHandler', () => {
  let handler: AuthChangePasswordCommandHandler;
  let mockUserRepository: any;
  let mockOtpRepository: any;
  let mockAuthService: any;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockOtpRepository = {
      findValidOtp: jest.fn().mockResolvedValue({}),
      deleteByEmailAndType: jest.fn(),
    };
    mockAuthService = {
      comparePassword: jest.fn(),
      hashPassword: jest.fn(),
    };
    handler = new AuthChangePasswordCommandHandler(mockUserRepository, mockOtpRepository, mockAuthService);
  });

  it('should successfully change password when old password matches', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'user@example.com',
      passwordHash: 'old-hashed-password',
      props: {
        passwordHash: 'old-hashed-password',
      },
      updatePassword: jest.fn().mockImplementation((passwordHash: string) => {
        mockUser.passwordHash = passwordHash;
        mockUser.props.passwordHash = passwordHash;
      }),
    };
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockAuthService.comparePassword.mockResolvedValue(true);
    mockAuthService.hashPassword.mockResolvedValue('new-hashed-password');

    const command = new AuthChangePasswordCommand('user-123', {
      oldPassword: 'oldPassword123',
      newPassword: 'newPassword123',
      otpCode: '123456',
    });

    const result = await handler.execute(command);

    expect(result).toEqual({ success: true });
    expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
    expect(mockOtpRepository.findValidOtp).toHaveBeenCalledWith('user@example.com', '123456', 'change_password');
    expect(mockAuthService.comparePassword).toHaveBeenCalledWith('oldPassword123', 'old-hashed-password');
    expect(mockAuthService.hashPassword).toHaveBeenCalledWith('newPassword123');
    expect(mockUser.updatePassword).toHaveBeenCalledWith('new-hashed-password');
    expect(mockUser.props.passwordHash).toBe('new-hashed-password');
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    expect(mockOtpRepository.deleteByEmailAndType).toHaveBeenCalledWith('user@example.com', 'change_password');
  });

  it('should throw UserNotFoundException when user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    const command = new AuthChangePasswordCommand('invalid-user', {
      oldPassword: 'oldPassword123',
      newPassword: 'newPassword123',
      otpCode: '123456',
    });

    await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
  });

  it('should throw error when old password does not match', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'user@example.com',
      passwordHash: 'old-hashed-password',
      updatePassword: jest.fn(),
    };
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockAuthService.comparePassword.mockResolvedValue(false);

    const command = new AuthChangePasswordCommand('user-123', {
      oldPassword: 'wrongOldPassword',
      newPassword: 'newPassword123',
      otpCode: '123456',
    });

    await expect(handler.execute(command)).rejects.toThrow('Invalid old password');
  });
});


