import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AuthSendOtpCommand } from './auth-send-otp.command';
import { AuthSendOtpOutputDto } from './auth-send-otp.dto';
import { OTP_REPOSITORY, type IOtpRepository } from '@/core/interfaces/repositories/otp.repository';
import { MAILER_SERVICE, type IMailerService } from '@/application/interfaces/mailer.interface';
import { AuthService } from '@/application/services/auth.service';
import { EOtpType } from '@/core/enums/otp-type.enum';
import { OtpRateLimitException } from '@/core/exceptions';


@CommandHandler(AuthSendOtpCommand)
export class AuthSendOtpCommandHandler implements ICommandHandler<AuthSendOtpCommand, AuthSendOtpOutputDto> {
  constructor(
    @Inject(OTP_REPOSITORY)
    private readonly otpRepository: IOtpRepository,
    @Inject(MAILER_SERVICE)
    private readonly mailerService: IMailerService,
    private readonly authService: AuthService,
  ) {}

  async execute(command: AuthSendOtpCommand): Promise<AuthSendOtpOutputDto> {
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

    // Map enum type to user-friendly purpose label
    let purpose = '';
    switch (input.type) {
      case EOtpType.CREATE_ACCOUNT:
        purpose = 'Create Account';
        break;
      case EOtpType.RESET_PASSWORD:
        purpose = 'Reset Password';
        break;
      case EOtpType.CHANGE_PASSWORD:
        purpose = 'Change Password';
        break;
      default:
        purpose = 'Verify Account';
    }

    try {
      await this.mailerService.sendMail({
        to: normalizedEmail,
        subject: `HiveK Verification Code - ${purpose}`,
        template: 'otp',
        context: {
          code,
          purpose,
        },
      });
    } catch (err) {
      // Do not fail command execution if mail sending fails (useful for local development/testing)
    }

    return { success: true };
  }
}
