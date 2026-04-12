export interface IJwtPayload {
  sub: string;
  email: string;
  role: string;
  [key: string]: any;
}

export interface IAuthJwtService {
  sign(payload: IJwtPayload): string;
  verify(token: string): IJwtPayload;
  decode(token: string): IJwtPayload;
}

export const AUTH_JWT_SERVICE = Symbol('AUTH_JWT_SERVICE');
