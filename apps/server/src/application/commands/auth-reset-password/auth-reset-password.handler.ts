import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthResetPasswordCommand } from './auth-reset-password.command';
import { AuthResetPasswordOutputDto } from './auth-reset-password.dto';

@CommandHandler(AuthResetPasswordCommand)
export class AuthResetPasswordCommandHandler implements ICommandHandler<AuthResetPasswordCommand, AuthResetPasswordOutputDto> {
  async execute(command: AuthResetPasswordCommand): Promise<AuthResetPasswordOutputDto> {
    return { success: true };
  }
}
