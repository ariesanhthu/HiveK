import { AuthSendOtpCommand } from '@/application/commands/auth-send-otp/auth-send-otp.command';
import { AuthSendOtpCommandHandler } from '@/application/commands/auth-send-otp/auth-send-otp.handler';
import { KOLUserRoot } from '@/core/aggregate-roots/kol-user.aggregate';
import { OtpRoot } from '@/core/aggregate-roots/otp.aggregate';
import { EOtpType, ERoleType } from '@/core/enums';
import {
  ForbiddenDomainException,
  OtpRateLimitException,
  UserNotFoundException,
} from '@/core/exceptions';
import { PhoneNumberVO } from '@/core/value-objects/phone-number.value-object';
import { jest } from '@jest/globals';
import {
  createMockOtpRepository,
  createMockUserRepository,
} from '../../../__mocks__/mock-repositories';
import {
  createMockAuthService,
  createMockOutboxService,
  createMockUnitOfWork,
} from '../../../__mocks__/mock-services';

describe('AuthSendOtpCommandHandler', () => {
  let handler: AuthSendOtpCommandHandler;
  let mockOtpRepository: ReturnType<typeof createMockOtpRepository>;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockOutboxService: ReturnType<typeof createMockOutboxService>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;
  let mockUow: ReturnType<typeof createMockUnitOfWork>;

  beforeEach(() => {
    mockOtpRepository = createMockOtpRepository();
    mockUserRepository = createMockUserRepository();
    mockOutboxService = createMockOutboxService();
    mockAuthService = createMockAuthService();
    mockUow = createMockUnitOfWork();

    handler = new AuthSendOtpCommandHandler(
      mockOtpRepository,
      mockUserRepository,
      mockOutboxService,
      mockAuthService,
      mockUow,
    );
  });

  describe('Happy Paths', () => {
    it('should successfully send an OTP email for RESET_PASSWORD (no userId required)', async () => {
      const input = { email: 'user@example.com', type: EOtpType.RESET_PASSWORD };
      const command = new AuthSendOtpCommand(input);

      mockOtpRepository.findRecentOtp.mockResolvedValue(null);

      const result = await handler.execute(command);

      expect(result).toEqual({ success: true });
      expect(mockAuthService.normalizeEmail).toHaveBeenCalledWith('user@example.com');
      expect(mockOtpRepository.findRecentOtp).toHaveBeenCalledWith(
        'user@example.com',
        EOtpType.RESET_PASSWORD,
        60,
      );
      expect(mockOtpRepository.deleteByEmailAndType).toHaveBeenCalledWith(
        'user@example.com',
        EOtpType.RESET_PASSWORD,
      );
      expect(mockOtpRepository.save).toHaveBeenCalledWith(expect.any(OtpRoot));

      expect(mockOutboxService.enqueueMany).toHaveBeenCalled();
      expect(mockUow.execute).toHaveBeenCalled();
    });

    it('should successfully send an OTP email for CREATE_ACCOUNT (userId required)', async () => {
      const userId = 'user-123';
      const input = { email: 'user@example.com', type: EOtpType.CREATE_ACCOUNT };
      const command = new AuthSendOtpCommand(input, userId);

      const mockUser = KOLUserRoot.instantiate(userId, {
        email: 'user@example.com',
        phone: PhoneNumberVO.create({ value: '+84987654321' }),
        passwordHash: 'hashed',
        roleId: 'role-1',
        isEmailVerified: false,
        type: ERoleType.KOL,
        fullName: 'KOL User',
        createdAt: new Date(),
        updatedAt: new Date(),
        deleteAt: null,
        deleteBy: null,
        refreshToken: null,
        googleId: null,
      });

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockOtpRepository.findRecentOtp.mockResolvedValue(null);

      const result = await handler.execute(command);

      expect(result).toEqual({ success: true });
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockOtpRepository.save).toHaveBeenCalledWith(expect.any(OtpRoot));
      expect(mockOutboxService.enqueueMany).toHaveBeenCalled();
    });
  });

  describe('Sad Paths & Edge Cases', () => {
    it('should throw OtpRateLimitException if an OTP was sent within the last 60 seconds', async () => {
      const input = { email: 'busy@example.com', type: EOtpType.RESET_PASSWORD };
      const command = new AuthSendOtpCommand(input);

      const recentOtp = OtpRoot.instantiate({
        id: 'otp-1',
        email: 'busy@example.com',
        code: '123456',
        type: EOtpType.RESET_PASSWORD,
        expiresAt: new Date(),
      });

      mockOtpRepository.findRecentOtp.mockResolvedValue(recentOtp);

      await expect(handler.execute(command)).rejects.toThrow(OtpRateLimitException);
      expect(mockOtpRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenDomainException for CREATE_ACCOUNT without userId', async () => {
      const input = { email: 'user@example.com', type: EOtpType.CREATE_ACCOUNT };
      const command = new AuthSendOtpCommand(input); // No userId

      await expect(handler.execute(command)).rejects.toThrow(ForbiddenDomainException);
    });

    it('should throw UserNotFoundException if user does not exist for CHANGE_PASSWORD', async () => {
      const userId = 'non-existent';
      const input = { email: 'user@example.com', type: EOtpType.CHANGE_PASSWORD };
      const command = new AuthSendOtpCommand(input, userId);

      mockUserRepository.findById.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
    });

    it('should throw UserNotFoundException if user is deleted for CHANGE_PASSWORD', async () => {
      const userId = 'deleted-user';
      const input = { email: 'user@example.com', type: EOtpType.CHANGE_PASSWORD };
      const command = new AuthSendOtpCommand(input, userId);

      const mockUser = KOLUserRoot.instantiate(userId, {
        email: 'user@example.com',
        phone: PhoneNumberVO.create({ value: '+84987654321' }),
        passwordHash: 'hashed',
        roleId: 'role-1',
        isEmailVerified: true,
        type: ERoleType.KOL,
        fullName: 'KOL User',
        createdAt: new Date(),
        updatedAt: new Date(),
        deleteAt: new Date(),
        deleteBy: 'admin',
        refreshToken: null,
        googleId: null,
      });

      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
    });
  });
});
