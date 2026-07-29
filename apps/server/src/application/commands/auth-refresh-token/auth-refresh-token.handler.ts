import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRefreshTokenCommand } from './auth-refresh-token.command';
import { AuthRefreshTokenOutputDto } from './auth-refresh-token.dto';
import { Inject } from '@nestjs/common';
import {
  AUTH_JWT_SERVICE,
  type IAuthJwtService,
} from '@/application/interfaces';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '@/core/interfaces/repositories';
import { AuthService } from '@/application/services/auth.service';
import {
  InvalidRefreshTokenException,
  UserNotFoundException,
} from '@/core/exceptions';

@CommandHandler(AuthRefreshTokenCommand)
export class AuthRefreshTokenCommandHandler implements ICommandHandler<
  AuthRefreshTokenCommand,
  AuthRefreshTokenOutputDto
> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(AUTH_JWT_SERVICE)
    private readonly jwtService: IAuthJwtService,
    private readonly authService: AuthService,
  ) {}

  async execute(
    command: AuthRefreshTokenCommand,
  ): Promise<AuthRefreshTokenOutputDto> {
    const { input } = command;

    let payload;
    try {
      payload = this.jwtService.verify(input.refreshToken);
    } catch (err) {
      throw new InvalidRefreshTokenException();
    }

    const userId = payload.sub;
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    if (user.refreshToken !== input.refreshToken) {
      throw new InvalidRefreshTokenException('Invalid refresh token');
    }

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.roleId,
      type: user.type,
      ...(payload.enterpriseId && { enterpriseId: payload.enterpriseId }),
      ...(payload.ownerId && { ownerId: payload.ownerId }),
      ...(payload.workspaceRole && { workspaceRole: payload.workspaceRole }),
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.generateTokens(tokenPayload);

    user.updateRefreshToken(newRefreshToken);
    await this.userRepository.save(user);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
