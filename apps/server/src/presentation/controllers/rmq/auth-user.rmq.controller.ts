import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RmqHandler } from '@/infrastructure/rabbitmq/rmq-consumer.registry';
import { AuthSendOtpCommand } from '@/application/commands/auth-send-otp/auth-send-otp.command';
import { EOtpType } from '@/core/enums/otp-type.enum';

@Controller()
export class AuthUserRmqController {
  constructor(private readonly commandBus: CommandBus) {}

  @RmqHandler({ queue: 'auth_user_queue', pattern: 'auth.user.registered' })
  async handleUserRegistered(data: any) {
    const { email } = data;

    // Trigger OTP sending for the newly registered user.
    // This command now handles both DB persistence and synchronous email sending.
    await this.commandBus.execute(
      new AuthSendOtpCommand({
        email,
        type: EOtpType.CREATE_ACCOUNT,
      }),
    );
  }
}
