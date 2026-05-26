import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthSignOutCommand } from './auth-sign-out.command';
import { AuthSignOutOutputDto } from './auth-sign-out.dto';

@CommandHandler(AuthSignOutCommand)
export class AuthSignOutCommandHandler implements ICommandHandler<AuthSignOutCommand, AuthSignOutOutputDto> {
  async execute(command: AuthSignOutCommand): Promise<AuthSignOutOutputDto> {
    return { success: true };
  }
}
