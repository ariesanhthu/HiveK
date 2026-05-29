import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRefreshTokenCommand } from './auth-refresh-token.command';
import { AuthRefreshTokenOutputDto } from './auth-refresh-token.dto';
import { Inject } from '@nestjs/common';
import { AUTH_JWT_SERVICE, type IAuthJwtService } from '@/application/interfaces';
import { USER_REPOSITORY, type IUserRepository } from '@/core/interfaces';
import { ConfigService } from '@nestjs/config';

@CommandHandler(AuthRefreshTokenCommand)
export class AuthRefreshTokenCommandHandler implements ICommandHandler<AuthRefreshTokenCommand, AuthRefreshTokenOutputDto> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(AUTH_JWT_SERVICE)
    private readonly jwtService: IAuthJwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: AuthRefreshTokenCommand): Promise<AuthRefreshTokenOutputDto> {
    const { input } = command;

    let payload;
    try {
      payload = this.jwtService.verify(input.refreshToken);
    } catch (err) {
      throw new Error('Invalid or expired refresh token');
    }

    const userId = payload.sub;
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.refreshToken !== input.refreshToken) {
      throw new Error('Invalid refresh token');
    }

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.roleId,
    };

    const accessExpiration = this.configService.get<number>('JWT_ACCESS_EXPIRATION_MINUTES', 30);
    const accessToken = this.jwtService.sign(tokenPayload, { expiresInMinutes: accessExpiration });
    
    const refreshExpiration = this.configService.get<number>('JWT_REFRESH_EXPIRATION_MINUTES', 10080);
    const newRefreshToken = this.jwtService.sign(tokenPayload, { expiresInMinutes: refreshExpiration });

    user.updateRefreshToken(newRefreshToken);
    await this.userRepository.save(user);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
