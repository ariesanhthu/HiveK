import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { AUTH_JWT_SERVICE, type IAuthJwtService, type IJwtPayload } from '@/application/interfaces/auth-jwt.interface';

/**
 * Extracts the `state` query parameter from the request, verifies it as a JWT,
 * and sets `req.user` with the decoded payload.
 *
 * Useful for OAuth callback endpoints where the `state` param carries the
 * authenticated user's identity (passed as a JWT from the OAuth initiation step).
 */
@Injectable()
export class StateAuthGuard implements CanActivate {
  constructor(
    @Inject(AUTH_JWT_SERVICE)
    private readonly jwtService: IAuthJwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const state = request.query?.state as string | undefined;

    if (!state) {
      throw new UnauthorizedException('Missing state parameter');
    }

    try {
      const payload: IJwtPayload = this.jwtService.verify(state);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired state token');
    }
  }
}
