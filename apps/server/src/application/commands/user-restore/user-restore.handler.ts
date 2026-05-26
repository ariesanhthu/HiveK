import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY, type IUserRepository } from '@/core/interfaces';
import { UserRestoreCommand } from './user-restore.command';

@CommandHandler(UserRestoreCommand)
export class UserRestoreCommandHandler implements ICommandHandler<UserRestoreCommand, void> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: UserRestoreCommand): Promise<void> {
    const { id } = command;

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.restore();
    await this.userRepository.save(user);
  }
}
