import { Controller, Get, UseGuards, Res, Req } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { Public, ApiOkResponseEnvelope } from '@/presentation/decorators';
import { GoogleAuthGuard } from '@/presentation/middleware/guards';
import { buildVersionedRoute } from '@/presentation/utils/versioned-route.util';
import { env } from '@/shared/utils';
import type { AuthenticatedRequest } from '@/core/types/common.type';
import { AuthSignInOutputDto } from '@/application/commands';

@ApiTags('OAuth')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@Controller(buildVersionedRoute('common', 'auth', 1))
export class OAuthController {
  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth sign-in' })
  async googleAuth() {
    return;
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiOkResponseEnvelope(AuthSignInOutputDto)
  async googleAuthCallback(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = req.user as Record<string, unknown>;
    if (result && result.accessToken) {
      response.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: env('NODE_ENV', 'development') === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
    }
    if (result && result.refreshToken) {
      response.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: env('NODE_ENV', 'development') === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }
    return result;
  }
}