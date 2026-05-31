import { Command } from '@nestjs/cqrs';
import { UserCreateInputDto } from '../../dtos/user.dto';

export class UserCreateCommand extends Command<string> {
  constructor(public readonly input: UserCreateInputDto) {
    super();
  }
}
