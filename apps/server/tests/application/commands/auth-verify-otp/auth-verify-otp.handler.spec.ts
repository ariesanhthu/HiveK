import { AuthVerifyOtpCommandHandler } from '@/application/commands/auth-verify-otp/auth-verify-otp.handler';
import { AuthVerifyOtpCommand } from '@/application/commands/auth-verify-otp/auth-verify-otp.command';
import { EOtpType } from '@/core/enums/otp-type.enum';
import { UserNotFoundException, InvalidOperationException } from '@/core/exceptions';
import { createMockUserRepository, createMockOtpRepository } from '../../../__mocks__/mock-repositories';
import { createMockAuthService } from '../../../__mocks__/mock-services';

describe('AuthVerifyOtpCommandHandler', () => {
  let handler: AuthVerifyOtpCommandHandler;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockOtpRepository: ReturnType<typeof createMockOtpRepository>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockOtpRepository = createMockOtpRepository();
    mockAuthService = createMockAuthService();

    handler = new AuthVerifyOtpCommandHandler(
      mockUserRepository,
      mockOtpRepository,
      mockAuthService as any,
    );
  });

  const createMockUser = () => ({
    email: 'user@example.com',
    verifyEmail: jest.fn(),
  });

  describe('Happy Paths', () => {
    it('should verify OTP successfully and mark user as verified', async () => {
      const input = { email: 'user@example.com', otpCode: '123456' };
      const command = new AuthVerifyOtpCommand(input);
      const mockUser = createMockUser();

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);
      mockOtpRepository.findValidOtp.mockResolvedValue({
        email: 'user@example.com',
        code: '123456',
        type: EOtpType.CREATE_ACCOUNT,
      } as any);

      const result = await handler.execute(command);

      expect(result).toEqual({ success: true });
      expect(mockAuthService.normalizeEmail).toHaveBeenCalledWith('user@example.com');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
      expect(mockOtpRepository.findValidOtp).toHaveBeenCalledWith(
        'user@example.com',
        '123456',
        EOtpType.CREATE_ACCOUNT,
      );
      expect(mockUser.verifyEmail).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(mockOtpRepository.deleteByEmailAndType).toHaveBeenCalledWith(
        'user@example.com',
        EOtpType.CREATE_ACCOUNT,
      );
    });
  });

  describe('Sad Paths', () => {
    it('should throw UserNotFoundException if user does not exist', async () => {
      const input = { email: 'nonexistent@example.com', otpCode: '123456' };
      const command = new AuthVerifyOtpCommand(input);

      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
      expect(mockOtpRepository.findValidOtp).not.toHaveBeenCalled();
    });

    it('should throw InvalidOperationException if OTP is invalid or expired', async () => {
      const input = { email: 'user@example.com', otpCode: 'wrong' };
      const command = new AuthVerifyOtpCommand(input);
      const mockUser = createMockUser();

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);
      mockOtpRepository.findValidOtp.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(InvalidOperationException);
      expect(mockUser.verifyEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(mockOtpRepository.deleteByEmailAndType).not.toHaveBeenCalled();
    });

    it('should normalize email before checking', async () => {
      const input = { email: '  USER@example.com  ', otpCode: '123456' };
      const command = new AuthVerifyOtpCommand(input);
      const mockUser = createMockUser();

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);
      mockOtpRepository.findValidOtp.mockResolvedValue({ email: 'user@example.com' } as any);

      await handler.execute(command);

      expect(mockAuthService.normalizeEmail).toHaveBeenCalledWith('  USER@example.com  ');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
      expect(mockOtpRepository.findValidOtp).toHaveBeenCalledWith(
        'user@example.com',
        '123456',
        EOtpType.CREATE_ACCOUNT,
      );
    });
  });
});
