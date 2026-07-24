import { EVENT_SERVICE, type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import type { IEventService } from '@/application/interfaces';
import { AuthService } from '@/application/services/auth.service';
import { EOtpType } from '@/core/enums/otp-type.enum';
import { InvalidOperationException, UserNotFoundException } from '@/core/exceptions';
import { type IUserRepository, USER_REPOSITORY } from '@/core/interfaces/repositories';
import { type IOtpRepository, OTP_REPOSITORY } from '@/core/interfaces/repositories/otp.repository';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthVerifyOtpCommand } from './auth-verify-otp.command';
import { AuthVerifyOtpOutputDto } from './auth-verify-otp.dto';

@CommandHandler(AuthVerifyOtpCommand)
export class AuthVerifyOtpCommandHandler implements
  ICommandHandler<
    AuthVerifyOtpCommand,
    AuthVerifyOtpOutputDto
  >
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(OTP_REPOSITORY) private readonly otpRepository: IOtpRepository,
    private readonly authService: AuthService,
    @Inject(EVENT_SERVICE) private readonly eventService: IEventService,
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
  ) {}

  async execute(
    command: AuthVerifyOtpCommand,
  ): Promise<AuthVerifyOtpOutputDto> {
    return this.uow.execute(async () => {
      const { input } = command;
      const normalizedEmail = this.authService.normalizeEmail(input.email);

      const user = await this.userRepository.findByEmail(normalizedEmail);
      if (!user) {
        throw new UserNotFoundException(normalizedEmail);
      }

      const validOtp = await this.otpRepository.findValidOtp(
        normalizedEmail,
        input.otpCode,
        EOtpType.CREATE_ACCOUNT,
      );

      if (!validOtp) {
        throw new InvalidOperationException('Invalid or expired OTP');
      }

      user.verifyEmail();
      await this.userRepository.save(user);

      await this.otpRepository.deleteByEmailAndType(
        normalizedEmail,
        EOtpType.CREATE_ACCOUNT,
      );

      await this.eventService.publishEvents(user);

      return { success: true };
    });
  }
}
