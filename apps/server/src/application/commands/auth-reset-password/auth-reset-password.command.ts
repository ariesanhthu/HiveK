import { Command } from '@nestjs/cqrs';
import {
  AuthResetPasswordInputDto,
  AuthResetPasswordOutputDto,
} from './auth-reset-password.dto';

export class AuthResetPasswordCommand extends Command<AuthResetPasswordOutputDto> {
  constructor(public readonly input: AuthResetPasswordInputDto) {
    super();
  }
}
