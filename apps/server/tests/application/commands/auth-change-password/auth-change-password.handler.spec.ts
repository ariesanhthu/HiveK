import { AuthChangePasswordCommandHandler } from '@/application/commands/auth-change-password/auth-change-password.handler';
import { AuthChangePasswordCommand } from '@/application/commands/auth-change-password/auth-change-password.command';
import { EOtpType } from '@/core/enums/otp-type.enum';
import { UserNotFoundException, InvalidOperationException, InvalidPasswordException } from '@/core/exceptions';
import { createMockUserRepository, createMockOtpRepository } from '../../../__mocks__/mock-repositories';
import { createMockAuthService } from '../../../__mocks__/mock-services';

describe('AuthChangePasswordCommandHandler', () => {
  let handler: AuthChangePasswordCommandHandler;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockOtpRepository: ReturnType<typeof createMockOtpRepository>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockOtpRepository = createMockOtpRepository();
    mockAuthService = createMockAuthService();

    handler = new AuthChangePasswordCommandHandler(
      mockUserRepository,
      mockOtpRepository,
      mockAuthService as any,
    );
  });

  const createMockUser = (overrides = {}) => ({
    id: 'user-123',
    email: 'user@example.com',
    passwordHash: 'old-hashed',
    updatePassword: jest.fn(),
    ...overrides,
  });

  describe('Happy Path', () => {
    it('should successfully change password', async () => {
      const userId = 'user-123';
      const input = {
        oldPassword: 'oldPassword123',
        newPassword: 'newPassword123',
        otpCode: '123456',
      };
      const command = new AuthChangePasswordCommand(userId, input);
      const mockUser = createMockUser();

      mockUserRepository.findById.mockResolvedValue(mockUser as any);
      mockOtpRepository.findValidOtp.mockResolvedValue({ id: 'otp-id' } as any);
      mockAuthService.comparePassword!.mockResolvedValue(true);
      mockAuthService.hashPassword!.mockResolvedValue('new-hashed');

      const result = await handler.execute(command);

      expect(result).toEqual({ success: true });
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockOtpRepository.findValidOtp).toHaveBeenCalledWith('user@example.com', '123456', EOtpType.CHANGE_PASSWORD);
      expect(mockAuthService.comparePassword).toHaveBeenCalledWith('oldPassword123', 'old-hashed');
      expect(mockAuthService.hashPassword).toHaveBeenCalledWith('newPassword123');
      expect(mockUser.updatePassword).toHaveBeenCalledWith('new-hashed');
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(mockOtpRepository.deleteByEmailAndType).toHaveBeenCalledWith('user@example.com', EOtpType.CHANGE_PASSWORD);
    });
  });

  describe('Sad Paths', () => {
    it('should throw UserNotFoundException if user does not exist', async () => {
      const command = new AuthChangePasswordCommand('none', { oldPassword: 'a', newPassword: 'b', otpCode: '1' });
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
    });

    it('should throw InvalidOperationException if OTP is invalid', async () => {
      const mockUser = createMockUser();
      const command = new AuthChangePasswordCommand('user-123', { oldPassword: 'a', newPassword: 'b', otpCode: 'wrong' });

      mockUserRepository.findById.mockResolvedValue(mockUser as any);
      mockOtpRepository.findValidOtp.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(InvalidOperationException);
    });

    it('should throw InvalidPasswordException if old password does not match', async () => {
      const mockUser = createMockUser();
      const command = new AuthChangePasswordCommand('user-123', { oldPassword: 'wrong', newPassword: 'b', otpCode: '123456' });

      mockUserRepository.findById.mockResolvedValue(mockUser as any);
      mockOtpRepository.findValidOtp.mockResolvedValue({ id: 'otp' } as any);
      mockAuthService.comparePassword!.mockResolvedValue(false);

      await expect(handler.execute(command)).rejects.toThrow(InvalidPasswordException);
    });
  });
});
