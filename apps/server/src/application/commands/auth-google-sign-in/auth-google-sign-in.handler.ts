import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthGoogleSignInCommand } from './auth-google-sign-in.command';
import { AuthGoogleSignInOutputDto } from './auth-google-sign-in.dto';
import { Inject } from '@nestjs/common';
import {
  USER_REPOSITORY,
  ROLE_REPOSITORY,
} from '@/core/interfaces/repositories';
import type {
  IUserRepository,
  IRoleRepository,
} from '@/core/interfaces/repositories';
import { ERoleType } from '@/core/enums';
import {
  KOLUserRoot,
  EnterpriseUserRoot,
  AdminRoot,
} from '@/core/aggregate-roots';
import { AuthService } from '@/application/services/auth.service';
import {
  UserDeletedException,
  RoleNotFoundException,
  InvalidUserTypeException,
} from '@/core/exceptions';
import { PhoneNumberVO } from '@/core/value-objects/phone-number.value-object';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
  EVENT_SERVICE,
} from '@/application/interfaces';
import type { IEventService } from '@/application/interfaces';

@CommandHandler(AuthGoogleSignInCommand)
export class AuthGoogleSignInCommandHandler implements ICommandHandler<
  AuthGoogleSignInCommand,
  AuthGoogleSignInOutputDto
> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    private readonly authService: AuthService,
    @Inject(EVENT_SERVICE)
    private readonly eventService: IEventService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(
    command: AuthGoogleSignInCommand,
  ): Promise<AuthGoogleSignInOutputDto> {
    return this.uow.execute(async () => {
      const { input } = command;

      const normalizedEmail = this.authService.normalizeEmail(input.email);
      let user = await this.userRepository.findByEmail(normalizedEmail);

      if (user) {
        if (user.deleteAt) {
          throw new UserDeletedException();
        }
        if (!user.googleId) {
          user.updateGoogleId(input.googleId);
        }
        if (!user.isEmailVerified) {
          user.verifyEmail();
        }
      } else {
        const type = input.type || ERoleType.KOL;
        const defaultRole = await this.roleRepository.findByTitle(type);
        if (!defaultRole) {
          throw new RoleNotFoundException(type);
        }

        const commonProps = {
          email: normalizedEmail,
          phone: PhoneNumberVO.create({ value: '+0000000000' }),
          passwordHash: '',
          fullName: input.displayName || 'Google User',
          type,
          roleId: defaultRole.id,
          googleId: input.googleId,
          isEmailVerified: true,
        };

        switch (type) {
          case ERoleType.KOL:
            user = KOLUserRoot.create(commonProps);
            break;
          case ERoleType.ENTERPRISE:
            user = EnterpriseUserRoot.create(commonProps);
            break;
          case ERoleType.ADMIN:
            user = AdminRoot.create(commonProps);
            break;
          default:
            throw new InvalidUserTypeException(`Invalid user type: ${type}`);
        }
      }

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.roleId,
        type: user.type,
      };

      const { accessToken, refreshToken } =
        await this.authService.generateTokens(payload);

      user.updateRefreshToken(refreshToken);
      await this.userRepository.save(user);

      await this.eventService.publishEvents(user);

      return { accessToken, refreshToken };
    });
  }
}
