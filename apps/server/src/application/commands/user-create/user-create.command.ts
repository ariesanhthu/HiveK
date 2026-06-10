import { Command } from '@nestjs/cqrs';
import { UserCreateInputDto } from './user-create.dto';

export class UserCreateCommand extends Command<string> {
  constructor(public readonly input: UserCreateInputDto) {
    super();
  }
}
