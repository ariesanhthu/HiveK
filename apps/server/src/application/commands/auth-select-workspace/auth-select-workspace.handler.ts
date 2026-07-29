import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AuthSelectWorkspaceCommand } from './auth-select-workspace.command';
import { AuthSelectWorkspaceOutputDto } from './auth-select-workspace.dto';
import {
  ENTERPRISE_REPOSITORY,
  type IEnterpriseRepository,
} from '@/core/interfaces/repositories';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '@/core/interfaces/repositories';
import { AuthService } from '@/application/services/auth.service';
import { WorkspaceAccessException } from '@/core/exceptions';
import { EEnterpriseMemberMode } from '@/core/enums';

@CommandHandler(AuthSelectWorkspaceCommand)
export class AuthSelectWorkspaceCommandHandler implements ICommandHandler<
  AuthSelectWorkspaceCommand,
  AuthSelectWorkspaceOutputDto
> {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(
    command: AuthSelectWorkspaceCommand,
  ): Promise<AuthSelectWorkspaceOutputDto> {
    const { input, userId } = command;
    const { enterpriseId } = input;

    const enterprise = await this.enterpriseRepository.findById(enterpriseId);
    if (!enterprise) {
      throw new WorkspaceAccessException('Enterprise not found');
    }

    if (!enterprise.isMember(userId)) {
      throw new WorkspaceAccessException(
        'User does not have access to this workspace',
      );
    }

    const ownerId = enterprise.userId;
    const role = enterprise.isOwner(userId)
      ? 'owner'
      : enterprise.isSubOwner(userId)
        ? EEnterpriseMemberMode.SUB_OWNER
        : EEnterpriseMemberMode.USER;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new WorkspaceAccessException('User not found');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.roleId,
      type: user.type,
      enterpriseId,
      ownerId,
      workspaceRole: role,
    };

    const { accessToken, refreshToken } =
      await this.authService.generateTokens(payload);

    user.updateRefreshToken(refreshToken);
    await this.userRepository.save(user);

    return { accessToken, refreshToken };
  }
}
