import { AuthVerifyOtpCommandHandler } from '@/application/commands/auth-verify-otp/auth-verify-otp.handler';
import { AuthVerifyOtpCommand } from '@/application/commands/auth-verify-otp/auth-verify-otp.command';
import { UserNotFoundException, InvalidOperationException } from '@/core/exceptions';

describe('AuthVerifyOtpCommandHandler', () => {
  let handler: AuthVerifyOtpCommandHandler;
  let mockUserRepository: any;
  let mockOtpRepository: any;
  let mockAuthService: any;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
    mockOtpRepository = {
      findValidOtp: jest.fn(),
      deleteByEmailAndType: jest.fn(),
    };
    mockAuthService = {
      normalizeEmail: jest.fn((email: string) => email.trim().toLowerCase()),
    };
    handler = new AuthVerifyOtpCommandHandler(mockUserRepository, mockOtpRepository, mockAuthService);
  });

  it('should verify OTP successfully and mark user as verified', async () => {
    const mockUser = {
      email: 'user@example.com',
      verifyEmail: jest.fn(),
    };
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockOtpRepository.findValidOtp.mockResolvedValue({ email: 'user@example.com', code: '123456' });

    const command = new AuthVerifyOtpCommand({
      email: 'user@example.com',
      otpCode: '123456',
    });

    const result = await handler.execute(command);

    expect(result).toEqual({ success: true });
    expect(mockAuthService.normalizeEmail).toHaveBeenCalledWith('user@example.com');
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(mockOtpRepository.findValidOtp).toHaveBeenCalledWith('user@example.com', '123456', 'create_account');
    expect(mockUser.verifyEmail).toHaveBeenCalled();
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    expect(mockOtpRepository.deleteByEmailAndType).toHaveBeenCalledWith('user@example.com', 'create_account');
  });

  it('should throw UserNotFoundException if user does not exist', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const command = new AuthVerifyOtpCommand({
      email: 'nonexistent@example.com',
      otpCode: '123456',
    });

    await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
  });

  it('should throw InvalidOperationException if OTP is invalid or expired', async () => {
    const mockUser = {
      email: 'user@example.com',
    };
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockOtpRepository.findValidOtp.mockResolvedValue(null);

    const command = new AuthVerifyOtpCommand({
      email: 'user@example.com',
      otpCode: 'wrongcode',
    });

    await expect(handler.execute(command)).rejects.toThrow(InvalidOperationException);
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });
});
