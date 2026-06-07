import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserUpdateCommand } from './user-update.command';
import { Inject } from '@nestjs/common';
import { UserNotFoundException } from '@/core/exceptions';
import { USER_REPOSITORY, type IUserRepository } from '@/core/interfaces/repositories';
import { EnterpriseUserRoot } from '@/core/aggregate-roots';
import { AuthService } from '@/application/services/auth.service';

@CommandHandler(UserUpdateCommand)
export class UserUpdateCommandHandler implements ICommandHandler<UserUpdateCommand, void> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(command: UserUpdateCommand): Promise<void> {
    const { id, input } = command;

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    const anyProps = user.props as any;

    if (input.fullName !== undefined) anyProps.fullName = input.fullName;
    if (input.phone !== undefined) anyProps.phone = input.phone;
    if (input.avatar !== undefined) anyProps.avatar = input.avatar;
    if (input.roleId !== undefined) anyProps.roleId = input.roleId;
    if (input.isEmailVerified !== undefined) anyProps.isEmailVerified = input.isEmailVerified;

    if (input.password !== undefined) {
      anyProps.passwordHash = await this.authService.hashPassword(input.password);
    }

    if (input.enterpriseIds !== undefined && user instanceof EnterpriseUserRoot) {
      anyProps.enterpriseIds = input.enterpriseIds;
    }

    anyProps.updatedAt = new Date();

    await this.userRepository.save(user);
  }
}
