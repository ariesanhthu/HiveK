import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserCreateCommand } from './user-create.command';
import { Inject } from '@nestjs/common';
import { UserConflictException, InvalidUserTypeException } from '@/core/exceptions';
import { USER_REPOSITORY, type IUserRepository } from '@/core/interfaces/repositories';
import { KOLUserRoot, EnterpriseUserRoot, AdminRoot } from '@/core/aggregate-roots';
import { ERoleType } from '@/core/enums';
import { AuthService } from '@/application/services/auth.service';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(UserCreateCommand)
export class UserCreateCommandHandler implements ICommandHandler<UserCreateCommand, string> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly authService: AuthService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: UserCreateCommand): Promise<string> {
    return this.uow.execute(async () => {
      const { input } = command;

      const normalizedEmail = this.authService.normalizeEmail(input.email);
      const existingUser = await this.userRepository.findByEmail(normalizedEmail);
      if (existingUser) {
        throw new UserConflictException('Email already in use');
      }

      const passwordHash = await this.authService.hashPassword(input.password);

      const commonProps = {
        email: normalizedEmail,
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
          });
          // If enterpriseIds are provided during creation, add them
          if (input.enterpriseIds && input.enterpriseIds.length > 0) {
              input.enterpriseIds.forEach(id => (user as EnterpriseUserRoot).addEnterprise(id));
          }
          break;
        case ERoleType.ADMIN:
          user = AdminRoot.create(commonProps);
          break;
        default:
          throw new InvalidUserTypeException(`Invalid user type: ${input.type}`);
      }

      await this.userRepository.save(user);

      return user.id!;
    });
  }
}
