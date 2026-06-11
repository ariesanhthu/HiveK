import { AuthChangePasswordCommandHandler } from '@/application/commands/auth-change-password/auth-change-password.handler';
import { AuthChangePasswordCommand } from '@/application/commands/auth-change-password/auth-change-password.command';
import { EOtpType, ERoleType } from '@/core/enums';
import { KOLUserRoot } from '@/core/aggregate-roots';
import { UserNotFoundException, InvalidOperationException, InvalidPasswordException } from '@/core/exceptions';
import { createMockUserRepository, createMockOtpRepository } from '../../../__mocks__/mock-repositories';
import { createMockAuthService, createMockOutboxService, createMockUnitOfWork } from '../../../__mocks__/mock-services';

describe('AuthChangePasswordCommandHandler', () => {
  let handler: AuthChangePasswordCommandHandler;
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

    handler = new AuthChangePasswordCommandHandler(
      mockUserRepository,
      mockOtpRepository,
      mockAuthService as any,
      mockOutboxService as any,
      mockUow,
    );
  });

  const userId = 'user-1';
  const changeInput = {
    oldPassword: 'oldPassword123',
    newPassword: 'newPassword123',
    otpCode: '123456',
  };

  const createTestUser = () => KOLUserRoot.instantiate(userId, {
    email: 'change@example.com',
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
    it('should successfully change password and clear OTP', async () => {
      const existingUser = createTestUser();
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockOtpRepository.findValidOtp.mockResolvedValue({ code: '123456' } as any);
      mockAuthService.comparePassword!.mockResolvedValue(true);
      mockAuthService.hashPassword!.mockResolvedValue('new-hash');

      const command = new AuthChangePasswordCommand(userId, changeInput);
      const result = await handler.execute(command);

      expect(result).toEqual({ success: true });
      expect(existingUser.passwordHash).toBe('new-hash');
      expect(mockUserRepository.save).toHaveBeenCalledWith(existingUser);
      expect(mockOtpRepository.deleteByEmailAndType).toHaveBeenCalledWith('change@example.com', EOtpType.CHANGE_PASSWORD);
      expect(mockUow.execute).toHaveBeenCalled();
    });
  });

  describe('Sad Paths', () => {
    it('should throw UserNotFoundException if user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const command = new AuthChangePasswordCommand(userId, changeInput);
      await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InvalidOperationException if OTP is invalid or expired', async () => {
      const existingUser = createTestUser();
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockOtpRepository.findValidOtp.mockResolvedValue(null);

      const command = new AuthChangePasswordCommand(userId, changeInput);
      await expect(handler.execute(command)).rejects.toThrow(InvalidOperationException);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InvalidPasswordException if old password does not match', async () => {
      const existingUser = createTestUser();
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockOtpRepository.findValidOtp.mockResolvedValue({ code: '123456' } as any);
      mockAuthService.comparePassword!.mockResolvedValue(false);

      const command = new AuthChangePasswordCommand(userId, changeInput);
      await expect(handler.execute(command)).rejects.toThrow(InvalidPasswordException);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });
});
