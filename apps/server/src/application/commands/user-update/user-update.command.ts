import { Command } from '@nestjs/cqrs';
import { UserUpdateInputDto } from './user-update.dto';
import { UserDto } from '@/application';

export class UserUpdateCommand extends Command<UserDto> {
  constructor(
    public readonly id: string,
    public readonly input: UserUpdateInputDto,
  ) {
    super();
  }
}
