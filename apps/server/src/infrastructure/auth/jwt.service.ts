import {
  AuthJwtRequest,
  IAuthJwtService,
  IJwtPayload,
  IJwtSignOptions,
  IJwtVerifyOptions,
} from '@/application/interfaces/auth-jwt.interface';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthService implements IAuthJwtService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: IJwtPayload, options?: IJwtSignOptions): string {
    const signOptions: Record<string, string | number | boolean | (string | RegExp)[]> = {};

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
    return this.jwtService.verify(token, options as Parameters<JwtService['verify']>[1]);
  }

  decode(token: string): IJwtPayload {
    return this.jwtService.decode(token);
  }

  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.split(' ')[1];
  }

  extractTokenFromCookie(req: AuthJwtRequest, cookieName = 'access_token'): string | null {
    if (req && req.cookies) {
      return req.cookies[cookieName] || null;
    }
    return null;
  }

  verifyAuthHeader(authHeader?: string): IJwtPayload {
    const token = this.extractTokenFromHeader(authHeader);
    if (!token) {
      throw new Error('No authorization token provided');
    }
    return this.verify(token);
  }

  verifyHandshake(authHeader?: string, handshakeToken?: string): IJwtPayload {
    let token = handshakeToken;
    if (!token) {
      token = this.extractTokenFromHeader(authHeader);
    } else if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    if (!token) {
      throw new Error('No authorization token provided');
    }
    return this.verify(token);
  }

  verifyRequest(req: AuthJwtRequest): IJwtPayload {
    const authHeader = Array.isArray(req?.headers?.['authorization'])
      ? req.headers['authorization'][0]
      : req?.headers?.['authorization'];
    let token = this.extractTokenFromHeader(authHeader);
    if (!token) {
      token = this.extractTokenFromCookie(req, 'access_token');
    }
    if (!token) {
      throw new Error('No authorization token provided');
    }
    return this.verify(token);
  }
}
