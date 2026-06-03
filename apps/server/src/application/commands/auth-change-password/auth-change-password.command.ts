import { AuthChangePasswordInputDto } from './auth-change-password.dto';

export class AuthChangePasswordCommand {
  constructor(
    public readonly userId: string,
    public readonly input: AuthChangePasswordInputDto,
  ) {}
}
