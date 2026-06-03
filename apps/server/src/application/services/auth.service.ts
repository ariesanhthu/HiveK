import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AUTH_JWT_SERVICE, type IAuthJwtService, type IJwtPayload } from '@/application/interfaces';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_JWT_SERVICE)
    private readonly jwtService: IAuthJwtService,
    private readonly configService: ConfigService,
  ) {}

  normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generateTokens(payload: IJwtPayload): Promise<{ accessToken: string; refreshToken: string }> {
    const accessExpiration = this.configService.get<number>('JWT_ACCESS_EXPIRATION_MINUTES', 30);
    const refreshExpiration = this.configService.get<number>('JWT_REFRESH_EXPIRATION_MINUTES', 10080);

    const accessToken = this.jwtService.sign(payload, { expiresInMinutes: accessExpiration });
    const refreshToken = this.jwtService.sign(payload, { expiresInMinutes: refreshExpiration });

    return { accessToken, refreshToken };
  }
}
