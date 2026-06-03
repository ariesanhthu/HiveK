import { AuthResetPasswordCommandHandler } from '@/application/commands/auth-reset-password/auth-reset-password.handler';
import { AuthResetPasswordCommand } from '@/application/commands/auth-reset-password/auth-reset-password.command';
import { UserNotFoundException } from '@/core/exceptions';

describe('AuthResetPasswordCommandHandler', () => {
  let handler: AuthResetPasswordCommandHandler;
  let mockUserRepository: any;
  let mockOtpRepository: any;
  let mockAuthService: any;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
    mockOtpRepository = {
      findValidOtp: jest.fn().mockResolvedValue({}),
      deleteByEmailAndType: jest.fn(),
    };
    mockAuthService = {
      normalizeEmail: jest.fn((email: string) => email.trim().toLowerCase()),
      hashPassword: jest.fn(() => Promise.resolve('hashed')),
    };
    handler = new AuthResetPasswordCommandHandler(mockUserRepository, mockOtpRepository, mockAuthService);
  });

  it('should reset password successfully', async () => {
    const mockUser = {
      email: 'user@example.com',
      fullName: 'Test User',
      props: {
        passwordHash: 'old-hash',
      },
    };
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);

    const command = new AuthResetPasswordCommand({
      email: 'user@example.com',
      otpCode: '123456',
      newPassword: 'newPassword123',
    });
    const result = await handler.execute(command);

    expect(result).toEqual({ success: true });
    expect(mockAuthService.normalizeEmail).toHaveBeenCalledWith('user@example.com');
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(mockOtpRepository.findValidOtp).toHaveBeenCalledWith('user@example.com', '123456', 'reset_password');
    expect(mockAuthService.hashPassword).toHaveBeenCalledWith('newPassword123');
    expect(mockUser.props.passwordHash).toBe('hashed');
    expect(mockUserRepository.save).toHaveBeenCalled();
    expect(mockOtpRepository.deleteByEmailAndType).toHaveBeenCalledWith('user@example.com', 'reset_password');
  });

  it('should throw UserNotFoundException if email does not exist', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const command = new AuthResetPasswordCommand({
      email: 'nonexistent@example.com',
      otpCode: '123456',
      newPassword: 'newPassword123',
    });
    await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
  });
});

