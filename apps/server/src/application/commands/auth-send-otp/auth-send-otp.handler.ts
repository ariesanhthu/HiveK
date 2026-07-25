import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AuthSendOtpCommand } from './auth-send-otp.command';
import { AuthSendOtpOutputDto } from './auth-send-otp.dto';
import { OTP_REPOSITORY, USER_REPOSITORY, type IOtpRepository, type IUserRepository } from '@/core/interfaces/repositories';
import { AuthService } from '@/application/services/auth.service';
import { OtpRoot } from '@/core/aggregate-roots/otp.aggregate';
import { OtpRateLimitException, ForbiddenDomainException, UserNotFoundException } from '@/core/exceptions';
import { type IUnitOfWork, UNIT_OF_WORK, EVENT_SERVICE } from '@/application/interfaces';
import type { IEventService } from '@/application/interfaces';
import { EOtpType } from '@/core/enums';

@CommandHandler(AuthSendOtpCommand)
export class AuthSendOtpCommandHandler implements ICommandHandler<AuthSendOtpCommand, AuthSendOtpOutputDto> {
  constructor(
    @Inject(OTP_REPOSITORY)
    private readonly otpRepository: IOtpRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(EVENT_SERVICE)
    private readonly eventService: IEventService,
    private readonly authService: AuthService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: AuthSendOtpCommand): Promise<AuthSendOtpOutputDto> {
    return this.uow.execute(async () => {
      const { input } = command;
      const normalizedEmail = this.authService.normalizeEmail(input.email);

      // Validate user status
      if (input.type === EOtpType.CHANGE_PASSWORD) {
        if (!command.userId) {
          throw new ForbiddenDomainException('User must sign in');
        }
        const user = await this.userRepository.findById(command.userId);
        if (!user || user.deleteAt !== null) {
          throw new UserNotFoundException(command.userId);
        }
      } else if (input.type === EOtpType.RESET_PASSWORD) {
        // For RESET_PASSWORD, verify the email is registered
        const user = await this.userRepository.findByEmail(normalizedEmail);
        if (!user || user.deleteAt !== null) {
          throw new UserNotFoundException(normalizedEmail);
        }
      } else if (input.type === EOtpType.CREATE_ACCOUNT) {
        // CREATE_ACCOUNT requires a userId (admin creating for a user, or self-registration with identity)
        if (!command.userId) {
          throw new ForbiddenDomainException('User must be identified to create account');
        }
        const user = await this.userRepository.findById(command.userId);
        if (!user || user.deleteAt !== null) {
          throw new UserNotFoundException(command.userId);
        }
      }

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
      const otp = OtpRoot.create({
        email: normalizedEmail,
        code,
        type: input.type,
        expiresAt,
      });
      await this.otpRepository.save(otp);

      await this.eventService.publishEvents(otp);

      return { success: true };
    });
  }
}
