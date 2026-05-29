import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserUpdateProfileCommand } from './user-update-profile.command';
import { UserUpdateProfileOutputDto } from './user-update-profile.dto';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY, type IUserRepository } from '@/core/interfaces/repositories';

@CommandHandler(UserUpdateProfileCommand)
export class UserUpdateProfileCommandHandler implements ICommandHandler<UserUpdateProfileCommand, UserUpdateProfileOutputDto> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) { }

  async execute(command: UserUpdateProfileCommand): Promise<UserUpdateProfileOutputDto> {
    const { userId, input } = command;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const anyProps = user.props as any;
    if ((input as any).firstName) anyProps.fullName = `${(input as any).firstName} ${(input as any).lastName || ''}`;

    await this.userRepository.save(user);

    return { success: true };
  }
}
