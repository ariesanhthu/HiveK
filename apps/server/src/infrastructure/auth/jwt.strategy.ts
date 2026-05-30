import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AUTH_JWT_SERVICE } from '@/application/interfaces/auth-jwt.interface';
import type { IAuthJwtService, IJwtPayload } from '@/application/interfaces/auth-jwt.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @Inject(AUTH_JWT_SERVICE)
    private readonly jwtService: IAuthJwtService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: any) => {
          return this.jwtService.extractTokenFromCookie(req, 'access_token');
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'secret'),
    });
  }

  async validate(payload: IJwtPayload) {
    return payload;
  }
}
