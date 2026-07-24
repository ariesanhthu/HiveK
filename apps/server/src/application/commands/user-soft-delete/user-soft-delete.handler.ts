import { UserNotFoundException } from '@/core/exceptions';
import { type IUserRepository, USER_REPOSITORY } from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserSoftDeleteCommand } from './user-soft-delete.command';

@CommandHandler(UserSoftDeleteCommand)
export class UserSoftDeleteCommandHandler implements
  ICommandHandler<
    UserSoftDeleteCommand,
    void
  >
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: UserSoftDeleteCommand): Promise<void> {
    const { id, deletedBy } = command;

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    user.softDelete(deletedBy);
    await this.userRepository.save(user);
  }
}
