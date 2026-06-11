import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AuthVerifyOtpCommand } from './auth-verify-otp.command';
import { AuthVerifyOtpOutputDto } from './auth-verify-otp.dto';
import { USER_REPOSITORY, type IUserRepository } from '@/core/interfaces/repositories';
import { OTP_REPOSITORY, type IOtpRepository } from '@/core/interfaces/repositories/otp.repository';
import { AuthService } from '@/application/services/auth.service';
import { EOtpType } from '@/core/enums/otp-type.enum';
import { UserNotFoundException, InvalidOperationException } from '@/core/exceptions';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { OutboxService } from '@/application/services/outbox.service';
import { EventMapper } from '@/application/mappers';

@CommandHandler(AuthVerifyOtpCommand)
export class AuthVerifyOtpCommandHandler implements ICommandHandler<AuthVerifyOtpCommand, AuthVerifyOtpOutputDto> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(OTP_REPOSITORY)
    private readonly otpRepository: IOtpRepository,
    private readonly authService: AuthService,
    private readonly outboxService: OutboxService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: AuthVerifyOtpCommand): Promise<AuthVerifyOtpOutputDto> {
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

      await this.otpRepository.deleteByEmailAndType(normalizedEmail, EOtpType.CREATE_ACCOUNT);

      const events = EventMapper.mapToIntegrationEvents(user.domainEvents);
      if (events.length > 0) {
        await this.outboxService.enqueueMany(events.map(event => ({
          eventType: event.eventType,
          payload: event.payload,
          metadata: event.metadata,
          transport: event.transport,
          maxRetry: 5,
        })));
      }

      return { success: true };
    });
  }
}
