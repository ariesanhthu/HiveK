import { Command } from '@nestjs/cqrs';
import { AuthSignUpInputDto, AuthSignUpOutputDto } from './auth-sign-up.dto';
import { UserType } from '@/core/enums';

export class AuthSignUpCommand extends Command<AuthSignUpOutputDto> {
  constructor(
    public readonly type: UserType,
    public readonly input: AuthSignUpInputDto,
  ) {
    super();
  }
}
