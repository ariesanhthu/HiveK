import { Command } from '@nestjs/cqrs';
import {
  UserUpdateProfileInputDto,
  UserUpdateProfileOutputDto,
} from './user-update-profile.dto';

export class UserUpdateProfileCommand extends Command<UserUpdateProfileOutputDto> {
  constructor(
    public readonly userId: string,
    public readonly input: UserUpdateProfileInputDto,
  ) {
    super();
  }
}
