import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthGoogleSignInCommand } from './auth-google-sign-in.command';
import { AuthGoogleSignInOutputDto } from './auth-google-sign-in.dto';
import { Inject } from '@nestjs/common';
import { AUTH_JWT_SERVICE, type IAuthJwtService } from '@/application/interfaces';
import { USER_REPOSITORY, ROLE_REPOSITORY } from '@/core/interfaces/repositories';
import type { IUserRepository, IRoleRepository } from '@/core/interfaces/repositories';
import { ERoleType } from '@/core/enums';
import { KOLUserRoot } from '@/core/aggregate-roots';
import { ConfigService } from '@nestjs/config';

@CommandHandler(AuthGoogleSignInCommand)
export class AuthGoogleSignInCommandHandler implements ICommandHandler<AuthGoogleSignInCommand, AuthGoogleSignInOutputDto> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(AUTH_JWT_SERVICE)
    private readonly jwtService: IAuthJwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: AuthGoogleSignInCommand): Promise<AuthGoogleSignInOutputDto> {
    const { input } = command;

    let user = await this.userRepository.findByEmail(input.email);

    if (user) {
      if (user.deleteAt) {
        throw new Error('User has been deleted');
      }
      if (!user.googleId) {
        user.updateGoogleId(input.googleId);
      }
    } else {
      const defaultRole = await this.roleRepository.findByTitle(ERoleType.KOL);
      if (!defaultRole) {
        throw new Error('Default role for KOL not found');
      }

      user = KOLUserRoot.create({
        email: input.email,
        phone: '0000000000',
        passwordHash: '',
        fullName: input.displayName || 'Google User',
        avatar: input.avatarUrl || null,
        type: ERoleType.KOL,
        roleId: defaultRole.id!,
        isEmailVerified: true,
        googleId: input.googleId,
      });
    }

    const payload = {
      sub: user.id!,
      email: user.email,
      role: user.roleId,
      type: user.type,
    };

    const accessExpiration = this.configService.get<number>('JWT_ACCESS_EXPIRATION_MINUTES', 30);
    const accessToken = this.jwtService.sign(payload, { expiresInMinutes: accessExpiration });

    const refreshExpiration = this.configService.get<number>('JWT_REFRESH_EXPIRATION_MINUTES', 10080);
    const refreshToken = this.jwtService.sign(payload, { expiresInMinutes: refreshExpiration });

    user.updateRefreshToken(refreshToken);
    await this.userRepository.save(user);

    return { accessToken, refreshToken };
  }
}
