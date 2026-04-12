import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateProfileCommand } from '../update-profile.command';
import { UpdateProfileOutputDto } from '../../dtos';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY, type IUserRepository } from '@/application/interfaces';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileCommandHandler implements ICommandHandler<UpdateProfileCommand, UpdateProfileOutputDto> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: UpdateProfileCommand): Promise<UpdateProfileOutputDto> {
    const { userId, input } = command;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Logic for updating profile fields based on input
    // This will be more specific once Influencer/Enterprise domains are fleshed out
    // For now, we update common fields if provided in input
    const anyProps = user.props as any;
    if ((input as any).firstName) anyProps.fullName = `${(input as any).firstName} ${(input as any).lastName || ''}`;
    
    await this.userRepository.save(user);

    return { success: true };
  }
}
