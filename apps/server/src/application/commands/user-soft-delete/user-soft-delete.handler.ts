import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY, type IUserRepository } from '@/core/interfaces';
import { UserSoftDeleteCommand } from './user-soft-delete.command';

@CommandHandler(UserSoftDeleteCommand)
export class UserSoftDeleteCommandHandler implements ICommandHandler<UserSoftDeleteCommand, void> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: UserSoftDeleteCommand): Promise<void> {
    const { id, deletedBy } = command;

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.softDelete(deletedBy);
    await this.userRepository.save(user);
  }
}
