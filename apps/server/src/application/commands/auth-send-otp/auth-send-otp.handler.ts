import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AuthSendOtpCommand } from './auth-send-otp.command';
import { AuthSendOtpOutputDto } from './auth-send-otp.dto';
import { OTP_REPOSITORY, type IOtpRepository } from '@/core/interfaces/repositories/otp.repository';
import { AuthService } from '@/application/services/auth.service';
import { OutboxService } from '@/application/services/outbox.service';
import { EOtpType } from '@/core/enums/otp-type.enum';
import { OtpRateLimitException } from '@/core/exceptions';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';


@CommandHandler(AuthSendOtpCommand)
export class AuthSendOtpCommandHandler implements ICommandHandler<AuthSendOtpCommand, AuthSendOtpOutputDto> {
  constructor(
    @Inject(OTP_REPOSITORY)
    private readonly otpRepository: IOtpRepository,
    private readonly outboxService: OutboxService,
    private readonly authService: AuthService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: AuthSendOtpCommand): Promise<AuthSendOtpOutputDto> {
    return this.uow.execute(async () => {
      const { input } = command;
      const normalizedEmail = this.authService.normalizeEmail(input.email);

      // Rate limiting check: max 1 OTP of each type per email per minute
      const recentOtp = await this.otpRepository.findRecentOtp(normalizedEmail, input.type, 60);
      if (recentOtp) {
        throw new OtpRateLimitException();
      }

      // Generate 6-digit OTP code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minutes validity

      // Clean up any existing OTPs of the same type for this email
      await this.otpRepository.deleteByEmailAndType(normalizedEmail, input.type);

      // Save new OTP
      await this.otpRepository.save(normalizedEmail, code, input.type, expiresAt);

      // Enqueue email dispatch via Outbox pattern
      await this.outboxService.enqueue('email.send', {
        email: normalizedEmail,
        code,
        type: input.type,
      });

      return { success: true };
    });
  }
}
