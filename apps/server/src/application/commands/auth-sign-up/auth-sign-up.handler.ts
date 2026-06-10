import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthSignUpCommand } from './auth-sign-up.command';
import { AuthSignUpOutputDto } from './auth-sign-up.dto';
import { Inject } from '@nestjs/common';
import { ROLE_READ_SERVICE, type IRoleReadService } from '@/application/interfaces';
import { USER_REPOSITORY, type IUserRepository } from '@/core/interfaces/repositories';
import { KOLUserRoot, EnterpriseUserRoot, AdminRoot } from '@/core/aggregate-roots';
import { ERoleType } from '@/core/enums';
import { AuthService } from '@/application/services/auth.service';
import { OutboxService } from '@/application/services/outbox.service';
import { UserConflictException, RoleNotFoundException, InvalidUserTypeException } from '@/core/exceptions';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { PhoneNumberVO } from '@/core/value-objects/phone-number.value-object';

@CommandHandler(AuthSignUpCommand)
export class AuthSignUpCommandHandler implements ICommandHandler<AuthSignUpCommand, AuthSignUpOutputDto> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_READ_SERVICE)
    private readonly roleReadService: IRoleReadService,
    private readonly authService: AuthService,
    private readonly outboxService: OutboxService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) { }

  async execute(command: AuthSignUpCommand): Promise<AuthSignUpOutputDto> {
    return this.uow.execute(async () => {
      const { input, type } = command;

      const normalizedEmail = this.authService.normalizeEmail(input.email);
      const existingUser = await this.userRepository.findByEmail(normalizedEmail);
      if (existingUser) {
        throw new UserConflictException('User already exists');
      }

      const roles = await this.roleReadService.findAll();
      const defaultRole = roles.data.find(r => r.title.toUpperCase() === type.toUpperCase()) || roles.data[0];
      if (!defaultRole) {
        throw new RoleNotFoundException(type);
      }

      const passwordHash = await this.authService.hashPassword(input.password);

      const phoneValue = input.phone
        ? PhoneNumberVO.create({ value: input.phone })
        : PhoneNumberVO.create({ value: '+84000000000' });

      const fullNameValue = input.fullName || 'DEFAULT NAME';

      let user;
      const commonProps = {
        email: normalizedEmail,
        phone: phoneValue,
        passwordHash,
        fullName: fullNameValue,
        avatar: null,
        type,
        roleId: defaultRole.id,
        isEmailVerified: false,
      };

      switch (type) {
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
          throw new InvalidUserTypeException(`Invalid user type: ${type}`);
      }

      await this.userRepository.save(user);

      // Enqueue "user registered" event via Outbox.
      // This is atomic with user creation.
      await this.outboxService.enqueue('auth.user.registered', {
        userId: user.id!,
        email: normalizedEmail,
        type: type,
        fullName: fullNameValue,
      });

      return { userId: user.id! };
    });
  }
}
