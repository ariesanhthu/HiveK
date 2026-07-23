export interface IJwtPayload {
  sub: string;
  email: string;
  role: string;
  [key: string]: any;
}

export interface IJwtSignOptions {
  expiresInMinutes?: number;
  secret?: string;
  audience?: string;
  issuer?: any;
  jwtid?: string;
  subject?: string;
}

export interface IJwtVerifyOptions {
  secret?: string;
  audience?: any;
  issuer?: any;
  subject?: string;
}

export interface IAuthJwtService {
  sign(payload: IJwtPayload, options?: IJwtSignOptions): string;
  verify(token: string, options?: IJwtVerifyOptions): IJwtPayload;
  decode(token: string): IJwtPayload;

  extractTokenFromHeader(authHeader?: string): string | null;
  extractTokenFromCookie(req: any, cookieName?: string): string | null;
  verifyAuthHeader(authHeader?: string): IJwtPayload;
  verifyHandshake(authHeader?: string, handshakeToken?: string): IJwtPayload;
  verifyRequest(req: any): IJwtPayload;
}

export const AUTH_JWT_SERVICE = Symbol('AUTH_JWT_SERVICE');
