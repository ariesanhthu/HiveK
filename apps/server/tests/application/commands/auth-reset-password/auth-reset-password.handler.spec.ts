import { AuthResetPasswordCommand } from '@/application/commands/auth-reset-password/auth-reset-password.command';
import { AuthResetPasswordCommandHandler } from '@/application/commands/auth-reset-password/auth-reset-password.handler';
import { KOLUserRoot } from '@/core/aggregate-roots/kol-user.aggregate';
import { OtpRoot } from '@/core/aggregate-roots/otp.aggregate';
import { EOtpType, ERoleType } from '@/core/enums';
import { InvalidOperationException, UserNotFoundException } from '@/core/exceptions';
import { PhoneNumberVO } from '@/core/value-objects/phone-number.value-object';
import {
  createMockOtpRepository,
  createMockUserRepository,
} from '../../../__mocks__/mock-repositories';
import {
  createMockAuthService,
  createMockOutboxService,
  createMockUnitOfWork,
} from '../../../__mocks__/mock-services';

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
      mockAuthService,
      mockOutboxService,
      mockUow,
    );
  });

  const resetInput = {
    email: 'reset@example.com',
    otpCode: '123456',
    newPassword: 'newPassword123',
  };

  const createExistingUser = () =>
    KOLUserRoot.instantiate('user-1', {
      email: 'reset@example.com',
      phone: PhoneNumberVO.create({ value: '+84123456789' }),
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

  const createMockOtp = () =>
    OtpRoot.instantiate('otp-1', {
      email: 'reset@example.com',
      code: '123456',
      type: EOtpType.RESET_PASSWORD,
      expiresAt: new Date(Date.now() + 10000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  describe('Happy Path', () => {
    it('should successfully reset password when OTP is valid', async () => {
      const user = createExistingUser();
      const otp = createMockOtp();

      mockAuthService.normalizeEmail.mockReturnValue('reset@example.com');
      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockOtpRepository.findValidOtp.mockResolvedValue(otp);
      mockAuthService.hashPassword.mockResolvedValue('new-hash');

      const command = new AuthResetPasswordCommand(resetInput);
      const result = await handler.execute(command);

      expect(result).toEqual({ success: true });
      expect(user.passwordHash).toBe('new-hash');
      expect(mockUserRepository.save).toHaveBeenCalledWith(user);
      expect(mockOtpRepository.deleteByEmailAndType).toHaveBeenCalledWith(
        'reset@example.com',
        EOtpType.RESET_PASSWORD,
      );
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
      const user = createExistingUser();
      mockAuthService.normalizeEmail.mockReturnValue('reset@example.com');
      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockOtpRepository.findValidOtp.mockResolvedValue(null);

      const command = new AuthResetPasswordCommand(resetInput);
      await expect(handler.execute(command)).rejects.toThrow(InvalidOperationException);
    });
  });
});
