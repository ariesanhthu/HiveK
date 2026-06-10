import { AuthResetPasswordCommandHandler } from '@/application/commands/auth-reset-password/auth-reset-password.handler';
import { AuthResetPasswordCommand } from '@/application/commands/auth-reset-password/auth-reset-password.command';
import { EOtpType } from '@/core/enums/otp-type.enum';
import { UserNotFoundException, InvalidOperationException } from '@/core/exceptions';
import { createMockUserRepository, createMockOtpRepository } from '../../../__mocks__/mock-repositories';
import { createMockAuthService } from '../../../__mocks__/mock-services';

describe('AuthResetPasswordCommandHandler', () => {
  let handler: AuthResetPasswordCommandHandler;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockOtpRepository: ReturnType<typeof createMockOtpRepository>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockOtpRepository = createMockOtpRepository();
    mockAuthService = createMockAuthService();

    handler = new AuthResetPasswordCommandHandler(
      mockUserRepository,
      mockOtpRepository,
      mockAuthService as any,
    );
  });

  const createMockUser = () => ({
    email: 'user@example.com',
    updatePassword: jest.fn(),
  });

  describe('Happy Path', () => {
    it('should successfully reset password', async () => {
      const input = {
        email: 'user@example.com',
        otpCode: '123456',
        newPassword: 'newPassword123',
      };
      const command = new AuthResetPasswordCommand(input);
      const mockUser = createMockUser();

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);
      mockOtpRepository.findValidOtp.mockResolvedValue({ id: 'otp' } as any);
      mockAuthService.hashPassword!.mockResolvedValue('new-hashed');

      const result = await handler.execute(command);

      expect(result).toEqual({ success: true });
      expect(mockAuthService.normalizeEmail).toHaveBeenCalledWith('user@example.com');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
      expect(mockOtpRepository.findValidOtp).toHaveBeenCalledWith('user@example.com', '123456', EOtpType.RESET_PASSWORD);
      expect(mockAuthService.hashPassword).toHaveBeenCalledWith('newPassword123');
      expect(mockUser.updatePassword).toHaveBeenCalledWith('new-hashed');
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(mockOtpRepository.deleteByEmailAndType).toHaveBeenCalledWith('user@example.com', EOtpType.RESET_PASSWORD);
    });
  });

  describe('Sad Paths', () => {
    it('should throw UserNotFoundException if email does not exist', async () => {
      const command = new AuthResetPasswordCommand({ email: 'none@example.com', otpCode: '1', newPassword: 'p' });
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
    });

    it('should throw InvalidOperationException if OTP is invalid', async () => {
      const mockUser = createMockUser();
      const command = new AuthResetPasswordCommand({ email: 'user@example.com', otpCode: 'wrong', newPassword: 'p' });

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);
      mockOtpRepository.findValidOtp.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(InvalidOperationException);
    });

    it('should normalize email before processing', async () => {
      const mockUser = createMockUser();
      const command = new AuthResetPasswordCommand({ email: '  USER@example.com  ', otpCode: '123', newPassword: 'p' });

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);
      mockOtpRepository.findValidOtp.mockResolvedValue({ id: 'otp' } as any);

      await handler.execute(command);

      expect(mockAuthService.normalizeEmail).toHaveBeenCalledWith('  USER@example.com  ');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
    });
  });
});
