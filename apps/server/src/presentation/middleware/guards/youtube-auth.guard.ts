import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class YoutubeAuthGuard extends AuthGuard('youtube') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const userId = req.user?.sub || req.user?.id;
    return {
      state: userId,
    };
  }
}
