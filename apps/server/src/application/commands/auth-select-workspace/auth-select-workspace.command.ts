import { Command } from '@nestjs/cqrs';
import {
  AuthSelectWorkspaceInputDto,
  AuthSelectWorkspaceOutputDto,
} from './auth-select-workspace.dto';

export class AuthSelectWorkspaceCommand extends Command<AuthSelectWorkspaceOutputDto> {
  constructor(
    public readonly input: AuthSelectWorkspaceInputDto,
    public readonly userId: string,
  ) {
    super();
  }
}
