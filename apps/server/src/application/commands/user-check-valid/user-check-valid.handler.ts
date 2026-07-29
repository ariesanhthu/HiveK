import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '@/core/interfaces/repositories';
import { UserNotFoundException } from '@/core/exceptions';
import { UserCheckValidCommand } from './user-check-valid.command';
import { UserDto, UserMapper } from '@/application';

@CommandHandler(UserCheckValidCommand)
export class UserCheckValidCommandHandler implements ICommandHandler<
  UserCheckValidCommand,
  UserDto
> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: UserCheckValidCommand): Promise<UserDto> {
    const { id } = command.input;
    const user = await this.userRepository.findById(id);
    if (!user || user?.deleteAt) {
      throw new UserNotFoundException(id);
    }
    return UserMapper.toDto(user);
  }
}
