import { AuthSendOtpCommandHandler } from '@/application/commands/auth-send-otp/auth-send-otp.handler';
import { AuthSendOtpCommand } from '@/application/commands/auth-send-otp/auth-send-otp.command';
import { EOtpType } from '@/core/enums/otp-type.enum';
import { OtpRateLimitException } from '@/core/exceptions';
import { createMockOtpRepository } from '../../../__mocks__/mock-repositories';
import { createMockAuthService, createMockMailerService } from '../../../__mocks__/mock-services';

describe('AuthSendOtpCommandHandler', () => {
  let handler: AuthSendOtpCommandHandler;
  let mockOtpRepository: ReturnType<typeof createMockOtpRepository>;
  let mockMailerService: ReturnType<typeof createMockMailerService>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;

  beforeEach(() => {
    mockOtpRepository = createMockOtpRepository();
    mockMailerService = createMockMailerService();
    mockAuthService = createMockAuthService();

    handler = new AuthSendOtpCommandHandler(
      mockOtpRepository,
      mockMailerService as any,
      mockAuthService as any,
    );
  });

  describe('Happy Paths', () => {
    const testCases = [
      { type: EOtpType.CREATE_ACCOUNT, purpose: 'Create Account' },
      { type: EOtpType.RESET_PASSWORD, purpose: 'Reset Password' },
      { type: EOtpType.CHANGE_PASSWORD, purpose: 'Change Password' },
    ];

    test.each(testCases)('should successfully send an OTP for %s', async ({ type, purpose }) => {
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
        subject: `HiveK Verification Code - ${purpose}`,
        template: 'otp',
        context: expect.objectContaining({
          code: expect.any(String),
          purpose,
        }),
      }));
    });

    it('should NOT fail command if mailer service throws an error', async () => {
      const input = { email: 'user@example.com', type: EOtpType.CREATE_ACCOUNT };
      const command = new AuthSendOtpCommand(input);

      mockOtpRepository.findRecentOtp.mockResolvedValue(null);
      mockMailerService.sendMail.mockRejectedValue(new Error('SMTP Error'));

      const result = await handler.execute(command);

      expect(result).toEqual({ success: true });
      expect(mockOtpRepository.save).toHaveBeenCalled();
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

    it('should normalize email before processing', async () => {
      const input = { email: '  User@Example.Com  ', type: EOtpType.CREATE_ACCOUNT };
      const command = new AuthSendOtpCommand(input);

      mockOtpRepository.findRecentOtp.mockResolvedValue(null);

      await handler.execute(command);

      expect(mockAuthService.normalizeEmail).toHaveBeenCalledWith('  User@Example.Com  ');
      expect(mockOtpRepository.findRecentOtp).toHaveBeenCalledWith('user@example.com', EOtpType.CREATE_ACCOUNT, 60);
      expect(mockOtpRepository.save).toHaveBeenCalledWith('user@example.com', expect.any(String), expect.any(String), expect.any(Date));
    });
  });
});
