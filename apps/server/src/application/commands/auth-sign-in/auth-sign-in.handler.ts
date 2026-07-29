import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthSignInCommand } from './auth-sign-in.command';
import { AuthSignInOutputDto } from './auth-sign-in.dto';
import { Inject } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '@/core/interfaces/repositories';
import { AuthService } from '@/application/services/auth.service';
import { InvalidCredentialsException } from '@/core/exceptions';
import { ERoleType, EEnterpriseMemberMode } from '@/core/enums';
import {
  ENTERPRISE_READ_SERVICE,
  type IEnterpriseReadService,
} from '@/application/interfaces/read-service/enterprise.read-service.interface';

@CommandHandler(AuthSignInCommand)
export class AuthSignInCommandHandler implements ICommandHandler<
  AuthSignInCommand,
  AuthSignInOutputDto
> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ENTERPRISE_READ_SERVICE)
    private readonly enterpriseReadService: IEnterpriseReadService,
    private readonly authService: AuthService,
  ) {}

  async execute(command: AuthSignInCommand): Promise<AuthSignInOutputDto> {
    const { input, isAdmin } = command;

    const normalizedEmail = this.authService.normalizeEmail(input.email);
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    if (isAdmin && user.type !== ERoleType.ADMIN) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await this.authService.comparePassword(
      input.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
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

    const accessibleEnterprises = await this.getAccessibleEnterprises(user.id);

    return { accessToken, refreshToken, accessibleEnterprises };
  }

  private async getAccessibleEnterprises(
    userId: string,
  ): Promise<Array<{ enterpriseId: string; role: string }>> {
    const result =
      await this.enterpriseReadService.findByUserIdOrMember(userId);
    return result.data.map((enterprise) => {
      const role =
        enterprise.userId === userId
          ? 'owner'
          : enterprise.members.find((m) => m.userId === userId)?.mode ===
              EEnterpriseMemberMode.SUB_OWNER
            ? EEnterpriseMemberMode.SUB_OWNER
            : EEnterpriseMemberMode.USER;
      return {
        enterpriseId: enterprise.id,
        role,
      };
    });
  }
}
