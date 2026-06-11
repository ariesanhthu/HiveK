import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RmqHandler } from '@/infrastructure/rabbitmq/rmq-consumer.registry';
import { AuthSendOtpCommand } from '@/application/commands/auth-send-otp/auth-send-otp.command';
import { EOtpType } from '@/core/enums/otp-type.enum';

@Controller()
export class AuthUserRmqController {
  constructor(private readonly commandBus: CommandBus) {}
}
