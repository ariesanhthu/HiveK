import { ERoleType } from '@/core/enums';
import { Command } from '@nestjs/cqrs';
import { AuthSignUpInputDto, AuthSignUpOutputDto } from './auth-sign-up.dto';

export class AuthSignUpCommand extends Command<AuthSignUpOutputDto> {
  constructor(
    public readonly type: ERoleType,
    public readonly input: AuthSignUpInputDto,
  ) {
    super();
  }
}
