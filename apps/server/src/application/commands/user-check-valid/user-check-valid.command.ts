import { UserDto } from '@/application/dtos';
import { Command } from '@nestjs/cqrs';
import { UserCheckValidInputDto } from './user-check-valid.dto';

export class UserCheckValidCommand extends Command<UserDto> {
  constructor(public readonly input: UserCheckValidInputDto) {
    super();
  }
}
