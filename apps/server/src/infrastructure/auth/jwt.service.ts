import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IAuthJwtService, IJwtPayload } from '@/application/interfaces/auth-jwt.interface';

@Injectable()
export class JwtAuthService implements IAuthJwtService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: IJwtPayload): string {
    return this.jwtService.sign(payload);
  }

  verify(token: string): IJwtPayload {
    return this.jwtService.verify(token);
  }

  decode(token: string): IJwtPayload {
    return this.jwtService.decode(token) as IJwtPayload;
  }
}
