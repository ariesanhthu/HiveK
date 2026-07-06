import type { JsonValue } from '@/core/types/common.type';
import type { AuthenticatedRequest } from '@/core/types/common.type';

export interface IJwtPayload {
  sub: string;
  email: string;
  role: string;
  [key: string]: JsonValue;
}

export interface IJwtSignOptions {
  expiresInMinutes?: number;
  secret?: string;
  audience?: string;
  issuer?: string;
  jwtid?: string;
  subject?: string;
}

export interface IJwtVerifyOptions {
  secret?: string;
  audience?: string;
  issuer?: string;
  subject?: string;
}

export interface IAuthJwtService {
  sign(payload: IJwtPayload, options?: IJwtSignOptions): string;
  verify(token: string, options?: IJwtVerifyOptions): IJwtPayload;
  decode(token: string): IJwtPayload;
  
  extractTokenFromHeader(authHeader?: string): string | null;
  extractTokenFromCookie(req: AuthenticatedRequest, cookieName?: string): string | null;
  verifyAuthHeader(authHeader?: string): IJwtPayload;
  verifyHandshake(authHeader?: string, handshakeToken?: string): IJwtPayload;
  verifyRequest(req: AuthenticatedRequest): IJwtPayload;
}

export const AUTH_JWT_SERVICE = Symbol('AUTH_JWT_SERVICE');
