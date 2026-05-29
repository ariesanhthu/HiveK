import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IAuthJwtService, IJwtPayload, IJwtSignOptions, IJwtVerifyOptions } from '@/application/interfaces/auth-jwt.interface';

@Injectable()
export class JwtAuthService implements IAuthJwtService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: IJwtPayload, options?: IJwtSignOptions): string {
    const signOptions: any = {};

    if (options) {
      if (options.expiresInMinutes !== undefined) {
        signOptions.expiresIn = options.expiresInMinutes * 60;
      }
      if (options.secret) signOptions.secret = options.secret;
      if (options.audience) signOptions.audience = options.audience;
      if (options.issuer) signOptions.issuer = options.issuer;
      if (options.jwtid) signOptions.jwtid = options.jwtid;
      if (options.subject) signOptions.subject = options.subject;
    }

    return this.jwtService.sign(payload, signOptions);
  }

  verify(token: string, options?: IJwtVerifyOptions): IJwtPayload {
    return this.jwtService.verify(token, options);
  }

  decode(token: string): IJwtPayload {
    return this.jwtService.decode(token) as IJwtPayload;
  }
}
