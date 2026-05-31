import { Command } from '@nestjs/cqrs';
import { AuthSignUpInputDto, AuthSignUpOutputDto } from './auth-sign-up.dto';
import { ERoleType } from '@/core/enums';

export class AuthSignUpCommand extends Command<AuthSignUpOutputDto> {
  constructor(
    public readonly type: ERoleType,
    public readonly input: AuthSignUpInputDto,
  ) {
    super();
  }
}
