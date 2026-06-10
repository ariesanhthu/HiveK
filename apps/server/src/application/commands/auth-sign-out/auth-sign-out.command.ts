import { Command } from '@nestjs/cqrs';
import { AuthSignOutOutputDto } from './auth-sign-out.dto';

export class AuthSignOutCommand extends Command<AuthSignOutOutputDto> {
  constructor(public readonly userId: string) {
    super();
  }
}