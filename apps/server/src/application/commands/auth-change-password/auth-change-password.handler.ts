import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AuthChangePasswordCommand } from './auth-change-password.command';
import { AuthChangePasswordOutputDto } from './auth-change-password.dto';
import { USER_REPOSITORY, OTP_REPOSITORY, type IUserRepository } from '@/core/interfaces/repositories';
import { type IOtpRepository } from '@/core/interfaces/repositories/otp.repository';
import { AuthService } from '@/application/services/auth.service';
import { UserNotFoundException, InvalidOperationException, InvalidPasswordException } from '@/core/exceptions';
import { EOtpType } from '@/core/enums/otp-type.enum';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { OutboxService } from '@/application/services/outbox.service';
import { EventMapper } from '@/application/mappers';

@CommandHandler(AuthChangePasswordCommand)
export class AuthChangePasswordCommandHandler implements ICommandHandler<AuthChangePasswordCommand, AuthChangePasswordOutputDto> {
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

  async execute(command: AuthChangePasswordCommand): Promise<AuthChangePasswordOutputDto> {
    return this.uow.execute(async () => {
      const { userId, input } = command;

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UserNotFoundException(userId);
      }

      // Verify OTP first
      const validOtp = await this.otpRepository.findValidOtp(
        user.email,
        input.otpCode,
        EOtpType.CHANGE_PASSWORD,
      );
      if (!validOtp) {
        throw new InvalidOperationException('Invalid or expired OTP');
      }

      const isOldPasswordValid = await this.authService.comparePassword(input.oldPassword, user.passwordHash);
      if (!isOldPasswordValid) {
        throw new InvalidPasswordException();
      }

      const newHashedPassword = await this.authService.hashPassword(input.newPassword);
      
      user.updatePassword(newHashedPassword);

      await this.userRepository.save(user);

      await this.otpRepository.deleteByEmailAndType(user.email, EOtpType.CHANGE_PASSWORD);

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

