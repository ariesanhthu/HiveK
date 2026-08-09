import { Controller, Get, UseGuards, Query, Res, Inject } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';
import {
  JwtAuthGuard,
  RolesGuard,
  UserVerifiedGuard,
  StateAuthGuard,
} from '@/presentation/middleware/guards';
import {
  CurrentUser,
  Roles,
  ApiOkResponseEnvelope,
} from '@/presentation/decorators';
import { ERoleType, ESocialPlatformCode } from '@/core/enums';
import {
  ENTERPRISE_REPOSITORY,
  type IEnterpriseRepository,
} from '@/core/interfaces/repositories';
import { SocialPageBulkConnectCommand } from '@/application/commands';
import {
  type ISocialPageConnectorFactory,
  SOCIAL_PAGE_CONNECTOR_FACTORY,
} from '@/core/interfaces';
import {
  AUTH_JWT_SERVICE,
  type IAuthJwtService,
  type IJwtPayload,
} from '@/application/interfaces/auth-jwt.interface';
import { errorMessage } from '@/shared/utils';
import { ConfigService } from '@nestjs/config';
import { WebHook } from '@/presentation/decorators/webhook.decorator';
import type { Response } from 'express';
import { FacebookOAuthConfigService } from '@/infrastructure/social-network/facebook/facebook-oauth-config.service';

@ApiTags('CLIENT-social-pages')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@Controller(buildVersionedRoute('client', 'social-pages', 1))
export class FacebookOAuthController {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
    private readonly configService: ConfigService,
    @Inject(AUTH_JWT_SERVICE)
    private readonly jwtService: IAuthJwtService,
    @Inject(SOCIAL_PAGE_CONNECTOR_FACTORY)
    private readonly connectorFactory: ISocialPageConnectorFactory,
    private readonly facebookOAuthConfig: FacebookOAuthConfigService,
  ) {}

  private async getEnterpriseId(userId: string): Promise<string> {
    const enterprise = await this.enterpriseRepository.findByUserId(userId);
    if (!enterprise) {
      throw new Error('User is not associated with any enterprise profile.');
    }
    return enterprise.id;
  }

  @UseGuards(JwtAuthGuard, RolesGuard, UserVerifiedGuard)
  @Roles(ERoleType.ENTERPRISE)
  @Get('facebook/oauth')
  @ApiOperation({ summary: 'Get Facebook OAuth Redirect URL' })
  @ApiOkResponseEnvelope()
  getOauthUrl(@CurrentUser() user: IJwtPayload) {
    // Sign a short-lived JWT with the user's identity as the OAuth state
    // so the callback can verify and extract userId, email, role via StateAuthGuard
    const state = this.jwtService.sign(
      { sub: user.sub, email: user.email, role: user.role },
      { expiresInMinutes: 10 },
    );

    const url = this.facebookOAuthConfig.buildAuthUrl(state);
    return { url };
  }

  @WebHook()
  @UseGuards(StateAuthGuard)
  @Get('facebook/callback')
  @ApiOperation({
    summary:
      'Exchange Facebook OAuth code, bulk connect pages, then redirect to the frontend',
  })
  async callback(
    @CurrentUser('sub') userId: string,
    @Query('code') code: string,
    @Res() res: Response,
  ): Promise<void> {
    const redirectEndpoint =
      this.configService.get<string>('REDIRECT_ENDPOINT') || '/';
    const redirectUri =
      this.configService.get<string>('FACEBOOK_CALLBACK_URL') || '';

    try {
      // 1. Resolve Facebook connector
      const connector = this.connectorFactory.findByCode('facebook');

      // 2. Exchange code for short lived user token
      const userToken = await connector.exchangeCodeForToken(code, redirectUri);

      // 3. Exchange for 60-day long lived user token
      const longLivedUserToken =
        await connector.exchangeForLongLivedToken(userToken);

      // 4. Resolve enterprise from userId (set by StateAuthGuard from the JWT state param)
      const enterpriseId = await this.getEnterpriseId(userId);

      // 5. Bulk connect Facebook pages via command handler
      await this.commandBus.execute(
        new SocialPageBulkConnectCommand(enterpriseId, {
          platformCode: ESocialPlatformCode.FACEBOOK,
          longLivedUserToken,
        }),
      );

      // // 6. Also bulk connect Instagram Business Accounts (linked through the same FB User Token)
      // await this.commandBus.execute(
      //   new SocialPageBulkConnectCommand(enterpriseId, {
      //     platformCode: ESocialPlatformCode.INSTAGRAM,
      //     longLivedUserToken,
      //   }),
      // );

      // 7. Redirect to frontend on success
      res.redirect(`${redirectEndpoint}?success=true`);
    } catch (error: unknown) {
      res.redirect(
        `${redirectEndpoint}?success=false&error=${encodeURIComponent(errorMessage(error))}`,
      );
    }
  }
}
