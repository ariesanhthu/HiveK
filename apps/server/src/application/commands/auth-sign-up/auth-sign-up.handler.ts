import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthSignUpCommand } from './auth-sign-up.command';
import { AuthSignUpOutputDto } from './auth-sign-up.dto';
import { Inject } from '@nestjs/common';
import { ROLE_READ_SERVICE, type IRoleReadService } from '@/application/interfaces';
import { USER_REPOSITORY, type IUserRepository } from '@/core/interfaces';
import { KOLUserRoot, EnterpriseUserRoot, AdminRoot } from '@/core/aggregate-roots';
import { UserType } from '@/core/enums';
import * as bcrypt from 'bcrypt';

@CommandHandler(AuthSignUpCommand)
export class AuthSignUpCommandHandler implements ICommandHandler<AuthSignUpCommand, AuthSignUpOutputDto> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_READ_SERVICE)
    private readonly roleReadService: IRoleReadService,
  ) {}

  async execute(command: AuthSignUpCommand): Promise<AuthSignUpOutputDto> {
    const { input, type } = command;

    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const roles = await this.roleReadService.findAll();
    const defaultRole = roles.data.find(r => r.title.toUpperCase() === type.toUpperCase()) || roles.data[0];
    if (!defaultRole) {
      throw new Error('No roles found in system');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    
    let user;
    const commonProps = {
      email: input.email,
      phone: '0000000000',
      passwordHash,
      fullName: 'DEFAULT NAME',
      type,
      roleId: defaultRole.id,
      isEmailVerified: false,
    };

    switch (type) {
      case UserType.KOL:
        user = KOLUserRoot.create(commonProps);
        break;
      case UserType.ENTERPRISE:
        user = EnterpriseUserRoot.create({
          ...commonProps,
          enterpriseId: 'placeholder-enterprise-id',
        });
        break;
      case UserType.ADMIN:
        user = AdminRoot.create(commonProps);
        break;
      default:
        throw new Error(`Invalid user type: ${type}`);
    }

    await this.userRepository.save(user);

    return { userId: user.id! };
  }
}
