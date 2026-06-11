import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AuthResetPasswordCommand } from './auth-reset-password.command';
import { AuthResetPasswordOutputDto } from './auth-reset-password.dto';
import { USER_REPOSITORY, OTP_REPOSITORY, type IUserRepository } from '@/core/interfaces/repositories';
import { type IOtpRepository } from '@/core/interfaces/repositories/otp.repository';
import { AuthService } from '@/application/services/auth.service';
import { UserNotFoundException, InvalidOperationException } from '@/core/exceptions';
import { EOtpType } from '@/core/enums/otp-type.enum';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { OutboxService } from '@/application/services/outbox.service';
import { EventMapper } from '@/application/mappers';

@CommandHandler(AuthResetPasswordCommand)
export class AuthResetPasswordCommandHandler implements ICommandHandler<AuthResetPasswordCommand, AuthResetPasswordOutputDto> {
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

  async execute(command: AuthResetPasswordCommand): Promise<AuthResetPasswordOutputDto> {
    return this.uow.execute(async () => {
      const { input } = command;
      const normalizedEmail = this.authService.normalizeEmail(input.email);
      const user = await this.userRepository.findByEmail(normalizedEmail);
      if (!user) {
        throw new UserNotFoundException(normalizedEmail);
      }

      // Verify OTP first
      const validOtp = await this.otpRepository.findValidOtp(
        normalizedEmail,
        input.otpCode,
        EOtpType.RESET_PASSWORD,
      );
      if (!validOtp) {
        throw new InvalidOperationException('Invalid or expired OTP');
      }

      const hashedPassword = await this.authService.hashPassword(input.newPassword);

      user.updatePassword(hashedPassword);

      await this.userRepository.save(user);

      await this.otpRepository.deleteByEmailAndType(normalizedEmail, EOtpType.RESET_PASSWORD);

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

