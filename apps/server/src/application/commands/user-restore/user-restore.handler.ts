import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserNotFoundException } from '@/core/exceptions';
import { USER_REPOSITORY, type IUserRepository } from '@/core/interfaces/repositories';
import { UserRestoreCommand } from './user-restore.command';

@CommandHandler(UserRestoreCommand)
export class UserRestoreCommandHandler implements ICommandHandler<UserRestoreCommand, void> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) { }

  async execute(command: UserRestoreCommand): Promise<void> {
    const { id } = command;

    const user = await this.userRepository.findByIdIncludingDeleted(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    user.restore();
    await this.userRepository.save(user);
  }
}
