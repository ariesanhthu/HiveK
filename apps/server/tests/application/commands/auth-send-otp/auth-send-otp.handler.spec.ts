import { AuthSendOtpCommandHandler } from '@/application/commands/auth-send-otp/auth-send-otp.handler';
import { AuthSendOtpCommand } from '@/application/commands/auth-send-otp/auth-send-otp.command';
import { EOtpType } from '@/core/enums/otp-type.enum';
import { OtpRateLimitException } from '@/core/exceptions';
import { createMockOtpRepository } from '../../../__mocks__/mock-repositories';
import { createMockAuthService, createMockOutboxService, createMockUnitOfWork } from '../../../__mocks__/mock-services';
import { OtpRoot } from '@/core/aggregate-roots/otp.aggregate';

describe('AuthSendOtpCommandHandler', () => {
  let handler: AuthSendOtpCommandHandler;
  let mockOtpRepository: ReturnType<typeof createMockOtpRepository>;
  let mockOutboxService: ReturnType<typeof createMockOutboxService>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;
  let mockUow: ReturnType<typeof createMockUnitOfWork>;

  beforeEach(() => {
    mockOtpRepository = createMockOtpRepository();
    mockOutboxService = createMockOutboxService();
    mockAuthService = createMockAuthService();
    mockUow = createMockUnitOfWork();

    handler = new AuthSendOtpCommandHandler(
      mockOtpRepository,
      mockOutboxService as any,
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
      // In reality, userRepository.save() might set the ID. 
      // For OtpRoot, we need to ensure it emits events.
      mockOtpRepository.save.mockImplementation(async (otp: OtpRoot) => {
        if (!otp.id) otp.setId('generated-id');
        return Promise.resolve();
      });

      const result = await handler.execute(command);

      expect(result).toEqual({ success: true });
      expect(mockAuthService.normalizeEmail).toHaveBeenCalledWith('user@example.com');
      expect(mockOtpRepository.findRecentOtp).toHaveBeenCalledWith('user@example.com', type, 60);
      expect(mockOtpRepository.deleteByEmailAndType).toHaveBeenCalledWith('user@example.com', type);
      expect(mockOtpRepository.save).toHaveBeenCalled();
      
      // Verification of Integration Event enqueuing
      expect(mockOutboxService.enqueueMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            eventType: 'SendVerificationEmailRequested',
            payload: expect.objectContaining({
              email: 'user@example.com',
              type,
            }),
            transport: expect.objectContaining({
                routingKey: 'email.send'
            })
          })
        ])
      );
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
      expect(mockOutboxService.enqueueMany).not.toHaveBeenCalled();
    });
  });
});
