import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SignUpCommand } from '../sign-up.command';
import { SignUpOutputDto } from '../../dtos';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY, type IUserRepository, ROLE_READ_SERVICE, type IRoleReadService } from '@/application/interfaces';
import { KOLUserRoot, EnterpriseUserRoot, AdminRoot } from '@/core/aggregate-roots';
import { UserType } from '@/core/enums';
import * as bcrypt from 'bcrypt';

@CommandHandler(SignUpCommand)
export class SignUpCommandHandler implements ICommandHandler<SignUpCommand, SignUpOutputDto> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_READ_SERVICE)
    private readonly roleReadService: IRoleReadService,
  ) {}

  async execute(command: SignUpCommand): Promise<SignUpOutputDto> {
    const { input, type } = command;

    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Simplified role selection for now
    const roles = await this.roleReadService.findAll();
    const defaultRole = roles.find(r => r.title.toUpperCase() === type.toUpperCase()) || roles[0];
    if (!defaultRole) {
      throw new Error('No roles found in system');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    
    let user;
    const commonProps = {
      email: input.email,
      phone: '0000000000', // Placeholder, should be updated later
      passwordHash,
      fullName: 'DEFAULT NAME', // Placeholder, should be updated later
      type,
      roleId: defaultRole.id,
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    switch (type) {
      case UserType.KOL:
        user = KOLUserRoot.create(commonProps);
        break;
      case UserType.ENTERPRISE:
        user = EnterpriseUserRoot.create({
          ...commonProps,
          enterpriseId: 'placeholder-enterprise-id',
        } as any);
        break;
      case UserType.ADMIN:
        user = AdminRoot.create(commonProps as any);
        break;
      default:
        throw new Error(`Invalid user type: ${type}`);
    }

    await this.userRepository.save(user);

    return { userId: user.id! };
  }
}
