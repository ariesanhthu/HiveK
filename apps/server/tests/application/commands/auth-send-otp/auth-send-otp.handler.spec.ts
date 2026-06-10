import { AuthSendOtpCommandHandler } from '@/application/commands/auth-send-otp/auth-send-otp.handler';
import { AuthSendOtpCommand } from '@/application/commands/auth-send-otp/auth-send-otp.command';
import { EOtpType } from '@/core/enums/otp-type.enum';
import { OtpRateLimitException } from '@/core/exceptions';
import { createMockOtpRepository } from '../../../__mocks__/mock-repositories';
import { createMockAuthService, createMockMailerService, createMockUnitOfWork } from '../../../__mocks__/mock-services';

describe('AuthSendOtpCommandHandler', () => {
  let handler: AuthSendOtpCommandHandler;
  let mockOtpRepository: ReturnType<typeof createMockOtpRepository>;
  let mockMailerService: ReturnType<typeof createMockMailerService>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;
  let mockUow: ReturnType<typeof createMockUnitOfWork>;

  beforeEach(() => {
    mockOtpRepository = createMockOtpRepository();
    mockMailerService = createMockMailerService();
    mockAuthService = createMockAuthService();
    mockUow = createMockUnitOfWork();

    handler = new AuthSendOtpCommandHandler(
      mockOtpRepository,
      mockMailerService as any,
      mockAuthService as any,
      mockUow,
    );
  });

  describe('Happy Paths', () => {
    const testCases = [
      { type: EOtpType.CREATE_ACCOUNT },
      { type: EOtpType.RESET_PASSWORD },
      { type: EOtpType.CHANGE_PASSWORD },
    ];

    test.each(testCases)('should successfully send an OTP email for %s', async ({ type }) => {
      const input = { email: 'user@example.com', type };
      const command = new AuthSendOtpCommand(input);

      mockOtpRepository.findRecentOtp.mockResolvedValue(null);

      const result = await handler.execute(command);

      expect(result).toEqual({ success: true });
      expect(mockAuthService.normalizeEmail).toHaveBeenCalledWith('user@example.com');
      expect(mockOtpRepository.findRecentOtp).toHaveBeenCalledWith('user@example.com', type, 60);
      expect(mockOtpRepository.deleteByEmailAndType).toHaveBeenCalledWith('user@example.com', type);
      expect(mockOtpRepository.save).toHaveBeenCalledWith(
        'user@example.com',
        expect.stringMatching(/^\d{6}$/),
        type,
        expect.any(Date),
      );
      
      expect(mockMailerService.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'user@example.com',
        subject: expect.stringContaining('HiveK Verification Code'),
      }));
      expect(mockUow.execute).toHaveBeenCalled();
    });
  });

  describe('Sad Paths & Edge Cases', () => {
    it('should throw OtpRateLimitException if an OTP was sent within the last 60 seconds', async () => {
      const input = { email: 'busy@example.com', type: EOtpType.CREATE_ACCOUNT };
      const command = new AuthSendOtpCommand(input);

      mockOtpRepository.findRecentOtp.mockResolvedValue({ id: 'recent' } as any);

      await expect(handler.execute(command)).rejects.toThrow(OtpRateLimitException);
      expect(mockOtpRepository.save).not.toHaveBeenCalled();
      expect(mockMailerService.sendMail).not.toHaveBeenCalled();
    });
  });
});
