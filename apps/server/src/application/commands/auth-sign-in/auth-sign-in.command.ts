import { Command } from '@nestjs/cqrs';
import { AuthSignInInputDto, AuthSignInOutputDto } from './auth-sign-in.dto';

export class AuthSignInCommand extends Command<AuthSignInOutputDto> {
  constructor(public readonly input: AuthSignInInputDto) {
    super();
  }
}
