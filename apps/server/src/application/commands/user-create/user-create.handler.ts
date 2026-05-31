import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserCreateCommand } from './user-create.command';
import { Inject } from '@nestjs/common';
import { UserConflictException } from '@/core/exceptions';
import { USER_REPOSITORY, type IUserRepository } from '@/core/interfaces/repositories';
import { KOLUserRoot, EnterpriseUserRoot, AdminRoot } from '@/core/aggregate-roots';
import { ERoleType } from '@/core/enums';
import * as bcrypt from 'bcrypt';

@CommandHandler(UserCreateCommand)
export class UserCreateCommandHandler implements ICommandHandler<UserCreateCommand, string> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: UserCreateCommand): Promise<string> {
    const { input } = command;

    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new UserConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const commonProps = {
      email: input.email,
      phone: input.phone || '0000000000',
      passwordHash,
      fullName: input.fullName,
      avatar: input.avatar || null,
      type: input.type,
      roleId: input.roleId,
      isEmailVerified: input.isEmailVerified ?? false,
    };

    let user;
    switch (input.type) {
      case ERoleType.KOL:
        user = KOLUserRoot.create(commonProps);
        break;
      case ERoleType.ENTERPRISE:
        user = EnterpriseUserRoot.create({
          ...commonProps,
          enterpriseId: input.enterpriseId || 'placeholder-enterprise-id',
        });
        break;
      case ERoleType.ADMIN:
        user = AdminRoot.create(commonProps);
        break;
      default:
        throw new Error(`Invalid user type: ${input.type}`);
    }

    await this.userRepository.save(user);

    return user.id!;
  }
}
