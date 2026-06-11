import { AuthVerifyOtpCommandHandler } from '@/application/commands/auth-verify-otp/auth-verify-otp.handler';
import { AuthVerifyOtpCommand } from '@/application/commands/auth-verify-otp/auth-verify-otp.command';
import { EOtpType, ERoleType } from '@/core/enums';
import { KOLUserRoot } from '@/core/aggregate-roots';
import { UserNotFoundException, InvalidOperationException } from '@/core/exceptions';
import { createMockUserRepository, createMockOtpRepository } from '../../../__mocks__/mock-repositories';
import { createMockAuthService, createMockOutboxService, createMockUnitOfWork } from '../../../__mocks__/mock-services';

describe('AuthVerifyOtpCommandHandler', () => {
  let handler: AuthVerifyOtpCommandHandler;
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

    handler = new AuthVerifyOtpCommandHandler(
      mockUserRepository,
      mockOtpRepository,
      mockAuthService as any,
      mockOutboxService as any,
      mockUow,
    );
  });

  const verifyInput = {
    email: 'verify@example.com',
    otpCode: '123456',
  };

  const existingUser = KOLUserRoot.instantiate('user-1', {
    email: 'verify@example.com',
    phone: { value: '+84123' } as any,
    passwordHash: 'hash',
    fullName: 'Test User',
    type: ERoleType.KOL,
    roleId: 'role-kol',
    isEmailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deleteAt: null,
    deleteBy: null,
    refreshToken: null,
    googleId: null,
  });

  describe('Happy Path', () => {
    it('should successfully verify email when OTP is valid', async () => {
      mockAuthService.normalizeEmail.mockReturnValue('verify@example.com');
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);
      mockOtpRepository.findValidOtp.mockResolvedValue({ code: '123456' } as any);

      const command = new AuthVerifyOtpCommand(verifyInput);
      const result = await handler.execute(command);

      expect(result).toEqual({ success: true });
      expect(existingUser.isEmailVerified).toBe(true);
      expect(mockUserRepository.save).toHaveBeenCalledWith(existingUser);
      expect(mockOtpRepository.deleteByEmailAndType).toHaveBeenCalledWith('verify@example.com', EOtpType.CREATE_ACCOUNT);
      expect(mockUow.execute).toHaveBeenCalled();
    });
  });

  describe('Sad Paths', () => {
    it('should throw UserNotFoundException if user does not exist', async () => {
      mockAuthService.normalizeEmail.mockReturnValue('verify@example.com');
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const command = new AuthVerifyOtpCommand(verifyInput);
      await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
    });

    it('should throw InvalidOperationException if OTP is invalid', async () => {
      mockAuthService.normalizeEmail.mockReturnValue('verify@example.com');
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);
      mockOtpRepository.findValidOtp.mockResolvedValue(null);

      const command = new AuthVerifyOtpCommand(verifyInput);
      await expect(handler.execute(command)).rejects.toThrow(InvalidOperationException);
    });
  });
});
