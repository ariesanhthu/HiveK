import { AuthJwtRequest } from '@/application/interfaces/auth-jwt.interface';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class YoutubeAuthGuard extends AuthGuard('youtube') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<AuthJwtRequest>();
    const userId = req.user?.sub || (req.user as Record<string, string> | undefined)?.id;
    return {
      state: userId,
    };
  }
}
