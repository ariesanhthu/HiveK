import { AuthRefreshTokenInputDto } from './auth-refresh-token.dto';

export class AuthRefreshTokenCommand {
  constructor(public readonly input: AuthRefreshTokenInputDto) {}
}
