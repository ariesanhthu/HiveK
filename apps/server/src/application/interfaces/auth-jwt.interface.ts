import type { Request as ExpressRequest } from 'express';
import type { FastifyRequest } from 'fastify';

export interface IJwtPayload {
  sub: string;
  email: string;
  role: string;
  [key: string]: string | number | boolean | Record<string, string | number | boolean> | undefined;
}

/**
 * Fastify Request extended with JWT authentication payload and cookies.
 */
export type AuthJwtFastifyRequest = Omit<FastifyRequest, 'user' | 'cookies'> & {
  user?: IJwtPayload;
  cookies?: Record<string, string>;
};

/**
 * Express Request extended with JWT authentication payload and cookies.
 */
export type AuthJwtExpressRequest = Omit<ExpressRequest, 'user' | 'cookies'> & {
  user?: IJwtPayload;
  cookies?: Record<string, string>;
};

export type AuthJwtRequest =
  | AuthJwtFastifyRequest
  | AuthJwtExpressRequest
  | {
    headers?: Record<string, string | string[] | undefined>;
    cookies?: Record<string, string>;
    user?: IJwtPayload;
  };

export interface IJwtSignOptions {
  expiresInMinutes?: number;
  secret?: string;
  audience?: string;
  issuer?: string | string[];
  jwtid?: string;
  subject?: string;
}

export interface IJwtVerifyOptions {
  secret?: string;
  audience?: string | RegExp | Array<string | RegExp>;
  issuer?: string | string[];
  subject?: string;
}

export interface IAuthJwtService {
  sign(payload: IJwtPayload, options?: IJwtSignOptions): string;
  verify(token: string, options?: IJwtVerifyOptions): IJwtPayload;
  decode(token: string): IJwtPayload;

  extractTokenFromHeader(authHeader?: string): string | null;
  extractTokenFromCookie(req: AuthJwtRequest, cookieName?: string): string | null;
  verifyAuthHeader(authHeader?: string): IJwtPayload;
  verifyHandshake(authHeader?: string, handshakeToken?: string): IJwtPayload;
  verifyRequest(req: AuthJwtRequest): IJwtPayload;
}

export const AUTH_JWT_SERVICE = Symbol('AUTH_JWT_SERVICE');
