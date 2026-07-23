import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { AuthService } from '@/application/services/auth.service';
import { AdminRoot, EnterpriseUserRoot, KOLUserRoot } from '@/core/aggregate-roots';
import { ERoleType } from '@/core/enums';
import { InvalidUserTypeException, UserConflictException } from '@/core/exceptions';
import { type IUserRepository, USER_REPOSITORY } from '@/core/interfaces/repositories';
import { PhoneNumberVO } from '@/core/value-objects/phone-number.value-object';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserCreateCommand } from './user-create.command';

@CommandHandler(UserCreateCommand)
export class UserCreateCommandHandler implements ICommandHandler<UserCreateCommand, string> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly authService: AuthService,
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
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
        phone: PhoneNumberVO.create({ value: input.phone }),
        passwordHash,
        fullName: input.fullName,
        type: input.type,
        roleId: input.roleId,
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
