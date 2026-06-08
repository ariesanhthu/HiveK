import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserUpdateCommand } from './user-update.command';
import { Inject } from '@nestjs/common';
import { UserNotFoundException } from '@/core/exceptions';
import { USER_REPOSITORY, type IUserRepository } from '@/core/interfaces/repositories';
import { AuthService } from '@/application/services/auth.service';
import { PhoneNumber } from '@/core/value-objects/phone-number.value-object';
import { UserDto, UserMapper } from '@/application';

@CommandHandler(UserUpdateCommand)
export class UserUpdateCommandHandler implements ICommandHandler<UserUpdateCommand, UserDto> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(command: UserUpdateCommand): Promise<UserDto> {
    const { id, input } = command;

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    if (input) {
      if (input.fullName !== undefined) user.updateFullName(input.fullName);
      if (input.phone !== undefined) user.updatePhone(PhoneNumber.create({ value: input.phone }));
  
      await this.userRepository.save(user);
    }
    return UserMapper.toDto(user);
  }
}
