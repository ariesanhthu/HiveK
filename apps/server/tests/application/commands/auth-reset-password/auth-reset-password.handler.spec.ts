import { AuthResetPasswordCommandHandler } from '@/application/commands/auth-reset-password/auth-reset-password.handler';
import { AuthResetPasswordCommand } from '@/application/commands/auth-reset-password/auth-reset-password.command';
import { EOtpType, ERoleType } from '@/core/enums';
import { KOLUserRoot } from '@/core/aggregate-roots';
import { UserNotFoundException, InvalidOperationException } from '@/core/exceptions';
import { createMockUserRepository, createMockOtpRepository } from '../../../__mocks__/mock-repositories';
import { createMockAuthService, createMockOutboxService, createMockUnitOfWork } from '../../../__mocks__/mock-services';

describe('AuthResetPasswordCommandHandler', () => {
  let handler: AuthResetPasswordCommandHandler;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockOtpRepository: ReturnType<typeof createMockOtpRepository>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;
  let mockOutboxService: ReturnType<typeof createMockOutboxService>;
  let mockUow: ReturnType<typeof createMockUnitOfWork>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockOtpRepository = createMockOtpRepository();
    mockAuthService = createMockAuthService();
    mockOutboxService = createMockOutboxService();
    mockUow = createMockUnitOfWork();

    handler = new AuthResetPasswordCommandHandler(
      mockUserRepository,
      mockOtpRepository,
      mockAuthService as any,
      mockOutboxService as any,
      mockUow,
    );
  });

  const resetInput = {
    email: 'reset@example.com',
    otpCode: '123456',
    newPassword: 'newPassword123',
  };

  const existingUser = KOLUserRoot.instantiate('user-1', {
    email: 'reset@example.com',
    phone: { value: '+84123' } as any,
    passwordHash: 'old-hash',
    fullName: 'Test User',
    type: ERoleType.KOL,
    roleId: 'role-kol',
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deleteAt: null,
    deleteBy: null,
    refreshToken: null,
    googleId: null,
  });

  describe('Happy Path', () => {
    it('should successfully reset password when OTP is valid', async () => {
      mockAuthService.normalizeEmail.mockReturnValue('reset@example.com');
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);
      mockOtpRepository.findValidOtp.mockResolvedValue({ code: '123456' } as any);
      mockAuthService.hashPassword!.mockResolvedValue('new-hash');

      const command = new AuthResetPasswordCommand(resetInput);
      const result = await handler.execute(command);

      expect(result).toEqual({ success: true });
      expect(existingUser.passwordHash).toBe('new-hash');
      expect(mockUserRepository.save).toHaveBeenCalledWith(existingUser);
      expect(mockOtpRepository.deleteByEmailAndType).toHaveBeenCalledWith('reset@example.com', EOtpType.RESET_PASSWORD);
      expect(mockUow.execute).toHaveBeenCalled();
    });
  });

  describe('Sad Paths', () => {
    it('should throw UserNotFoundException if user does not exist', async () => {
      mockAuthService.normalizeEmail.mockReturnValue('reset@example.com');
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const command = new AuthResetPasswordCommand(resetInput);
      await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
    });

    it('should throw InvalidOperationException if OTP is invalid', async () => {
      mockAuthService.normalizeEmail.mockReturnValue('reset@example.com');
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);
      mockOtpRepository.findValidOtp.mockResolvedValue(null);

      const command = new AuthResetPasswordCommand(resetInput);
      await expect(handler.execute(command)).rejects.toThrow(InvalidOperationException);
    });
  });
});
