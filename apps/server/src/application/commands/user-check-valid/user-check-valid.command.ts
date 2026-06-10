import { Command } from '@nestjs/cqrs';
import { UserCheckValidInputDto } from './user-check-valid.dto';
import { UserDto } from '@/application/dtos';

export class UserCheckValidCommand extends Command<UserDto> {
  constructor(public readonly input: UserCheckValidInputDto) {
    super();
  }
}
