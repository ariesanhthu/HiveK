import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { AuthSignUpCommand } from './auth-sign-up.command';
import { AuthSignUpOutputDto } from './auth-sign-up.dto';
import { Inject } from '@nestjs/common';
import { ROLE_READ_SERVICE, type IRoleReadService } from '@/application/interfaces';
import { USER_REPOSITORY, type IUserRepository } from '@/core/interfaces/repositories';
import { KOLUserRoot, EnterpriseUserRoot, AdminRoot } from '@/core/aggregate-roots';
import { ERoleType } from '@/core/enums';
import { AuthService } from '@/application/services/auth.service';
import { AuthSendOtpCommand } from '../auth-send-otp/auth-send-otp.command';
import { EOtpType } from '@/core/enums/otp-type.enum';
import { UserConflictException, RoleNotFoundException, InvalidUserTypeException } from '@/core/exceptions';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(AuthSignUpCommand)
export class AuthSignUpCommandHandler implements ICommandHandler<AuthSignUpCommand, AuthSignUpOutputDto> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_READ_SERVICE)
    private readonly roleReadService: IRoleReadService,
    private readonly authService: AuthService,
    private readonly commandBus: CommandBus,
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

      let user;
      const commonProps = {
        email: normalizedEmail,
        phone: '0000000000',
        passwordHash,
        fullName: 'DEFAULT NAME',
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

      try {
        await this.commandBus.execute(
          new AuthSendOtpCommand({
            email: normalizedEmail,
            type: EOtpType.CREATE_ACCOUNT,
          }),
        );
      } catch (error) {
        // Do not block signup if OTP dispatch fails
      }

      return { userId: user.id! };
    });
  }
}
