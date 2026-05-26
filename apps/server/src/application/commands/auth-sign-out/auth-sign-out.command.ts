import { Command } from '@nestjs/cqrs';
import { AuthSignOutInputDto, AuthSignOutOutputDto } from './auth-sign-out.dto';

export class AuthSignOutCommand extends Command<AuthSignOutOutputDto> {
  constructor(public readonly input: AuthSignOutInputDto) {
    super();
  }
}
