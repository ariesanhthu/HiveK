import { Command } from '@nestjs/cqrs';
import {
  AuthGoogleSignInInputDto,
  AuthGoogleSignInOutputDto,
} from './auth-google-sign-in.dto';

export class AuthGoogleSignInCommand extends Command<AuthGoogleSignInOutputDto> {
  constructor(public readonly input: AuthGoogleSignInInputDto) {
    super();
  }
}
