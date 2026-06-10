import { AuthSendOtpCommandHandler } from '@/application/commands/auth-send-otp/auth-send-otp.handler';
import { AuthSendOtpCommand } from '@/application/commands/auth-send-otp/auth-send-otp.command';
import { EOtpType } from '@/core/enums/otp-type.enum';
import { OtpRateLimitException } from '@/core/exceptions';

describe('AuthSendOtpCommandHandler', () => {
  let handler: AuthSendOtpCommandHandler;
  let mockOtpRepository: any;
  let mockMailerService: any;
  let mockAuthService: any;

  beforeEach(() => {
    mockOtpRepository = {
      save: jest.fn(),
      deleteByEmailAndType: jest.fn(),
      findRecentOtp: jest.fn().mockResolvedValue(null),
    };
    mockMailerService = {
      sendMail: jest.fn(),
    };
    mockAuthService = {
      normalizeEmail: jest.fn((email: string) => email.trim().toLowerCase()),
    };
    handler = new AuthSendOtpCommandHandler(mockOtpRepository, mockMailerService, mockAuthService);
  });

  it('should successfully send an OTP', async () => {
    const command = new AuthSendOtpCommand({
      email: 'user@example.com',
      type: EOtpType.RESET_PASSWORD,
    });

    const result = await handler.execute(command);

    expect(result).toEqual({ success: true });
    expect(mockAuthService.normalizeEmail).toHaveBeenCalledWith('user@example.com');
    expect(mockOtpRepository.findRecentOtp).toHaveBeenCalledWith('user@example.com', EOtpType.RESET_PASSWORD, 60);
    expect(mockOtpRepository.deleteByEmailAndType).toHaveBeenCalledWith('user@example.com', EOtpType.RESET_PASSWORD);
    expect(mockOtpRepository.save).toHaveBeenCalledWith(
      'user@example.com',
      expect.any(String),
      EOtpType.RESET_PASSWORD,
      expect.any(Date),
    );
    expect(mockMailerService.sendMail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'HiveK Verification Code - Reset Password',
      template: 'otp',
      context: {
        code: expect.any(String),
        purpose: 'Reset Password',
      },
    });
  });

  it('should throw OtpRateLimitException if OTP was requested within 1 minute', async () => {
    mockOtpRepository.findRecentOtp.mockResolvedValue({
      email: 'user@example.com',
      type: EOtpType.RESET_PASSWORD,
    });

    const command = new AuthSendOtpCommand({
      email: 'user@example.com',
      type: EOtpType.RESET_PASSWORD,
    });

    await expect(handler.execute(command)).rejects.toThrow(OtpRateLimitException);
    expect(mockOtpRepository.save).not.toHaveBeenCalled();
    expect(mockMailerService.sendMail).not.toHaveBeenCalled();
  });
});

