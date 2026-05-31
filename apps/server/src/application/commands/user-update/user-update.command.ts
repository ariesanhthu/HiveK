import { Command } from '@nestjs/cqrs';
import { UserUpdateInputDto } from '../../dtos/user.dto';

export class UserUpdateCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly input: UserUpdateInputDto,
  ) {
    super();
  }
}
