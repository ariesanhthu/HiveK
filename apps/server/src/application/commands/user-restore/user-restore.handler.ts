import { UserNotFoundException } from '@/core/exceptions';
import { type IUserRepository, USER_REPOSITORY } from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRestoreCommand } from './user-restore.command';

@CommandHandler(UserRestoreCommand)
export class UserRestoreCommandHandler implements
  ICommandHandler<
    UserRestoreCommand,
    void
  >
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: UserRestoreCommand): Promise<void> {
    const { id } = command;

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    user.restore();
    await this.userRepository.save(user);
  }
}
