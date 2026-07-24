import { AUTH_JWT_SERVICE, type IAuthJwtService, type IJwtPayload } from '@/application/interfaces';
import { AuthConfig } from '@/configs';
import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_JWT_SERVICE) private readonly jwtService: IAuthJwtService,
    private readonly authConfig: AuthConfig,
  ) {
    console.log('=== AuthService constructor executed ===');
  }

  normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generateTokens(
    payload: IJwtPayload,
  ): Promise<{ accessToken: string; refreshToken: string; }> {
    const accessExpiration = this.authConfig.getJwtAccessExpirationMinutes();
    const refreshExpiration = this.authConfig.getJwtRefreshExpirationDays() * 24 * 60;

    const accessToken = this.jwtService.sign(payload, {
      expiresInMinutes: accessExpiration,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresInMinutes: refreshExpiration,
    });

    return { accessToken, refreshToken };
  }
}
