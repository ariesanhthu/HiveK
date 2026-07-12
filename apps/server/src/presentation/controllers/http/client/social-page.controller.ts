import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ForbiddenException,
  Inject,
  Redirect,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';
import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';
import { CurrentUser } from '@/presentation/decorators/current-user.decorator';
import { Roles } from '@/presentation/decorators/roles.decorator';
import { ERoleType } from '@/core/enums';
import { ENTERPRISE_REPOSITORY, type IEnterpriseRepository } from '@/core/interfaces/repositories';
import {
  SocialPageConnectCommand,
  SocialPageDisconnectCommand,
  SocialPageConnectInputDto,
  SocialPageRefreshTokenCommand,
} from '@/application/commands';
import { SocialPageGetListQuery } from '@/application/queries';
import { SocialPageDto } from '@/application/dtos';
import { FacebookTokenService } from '@/infrastructure/facebook/facebook-token.service';
import { ConfigService } from '@nestjs/config';
import { Public } from '@/presentation/decorators/public.decorator';
import { WebHook } from '@/presentation/decorators/webhook.decorator';

@ApiTags('CLIENT-social-pages')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard)
@Roles(ERoleType.ENTERPRISE)
@Controller(buildVersionedRoute('client', 'social-pages', 1))
export class SocialPageController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
    private readonly facebookTokenService: FacebookTokenService,
    private readonly configService: ConfigService,
  ) {}

  private async getEnterpriseId(userId: string): Promise<string> {
    const enterprise = await this.enterpriseRepository.findByUserId(userId);
    if (!enterprise) {
      throw new ForbiddenException('User is not associated with any enterprise profile.');
    }
    return enterprise.id!;
  }

  @Get()
  @ApiOperation({ summary: 'Get all connected social pages' })
  async findAll(@CurrentUser('sub') userId: string): Promise<SocialPageDto[]> {
    const enterpriseId = await this.getEnterpriseId(userId);
    return this.queryBus.execute(new SocialPageGetListQuery(enterpriseId));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Disconnect a social page' })
  async disconnect(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    const enterpriseId = await this.getEnterpriseId(userId);
    return this.commandBus.execute(new SocialPageDisconnectCommand(id, enterpriseId, userId));
  }

  @Public()
  @Get('facebook/oauth')
  @ApiOperation({ summary: 'Get Facebook OAuth Redirect URL' })
  async getFacebookOauthUrl(@CurrentUser('sub') userId: string) {
    const appId = this.configService.get<string>('FACEBOOK_APP_ID') || '';
    const redirectUri = this.configService.get<string>('FACEBOOK_CALLBACK_URL') || '';
    const scope = 'public_profile,pages_show_list';
    // const scope = 'pages_manage_posts,pages_read_engagement,pages_show_list,pages_messaging';
    
    const url = `https://www.facebook.com/v25.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scope}&state=${userId}`;

    return { url };
  }

  @WebHook()
  @Get('facebook/callback')
  @ApiOperation({ summary: 'Exchange Facebook OAuth code for long-lived access token and list manageable pages' })
  async facebookCallback(
    @CurrentUser('sub') userId: string,
    @Query('code') code: string,
  ) {
    const redirectUri = this.configService.get<string>('FACEBOOK_CALLBACK_URL') || '';
    
    // 1. Exchange code for short lived user token
    const userToken = await this.facebookTokenService.exchangeCodeForUserToken(code, redirectUri);

    // 2. Exchange for 60-day long lived user token
    const longLivedUserToken = await this.facebookTokenService.exchangeUserTokenForLongLivedToken(userToken);

    // 3. Fetch manageable page list
    const pages = await this.facebookTokenService.getUserAccounts(longLivedUserToken);

    return pages.map((page) => ({
      pageId: page.id,
      pageName: page.name,
      // Temporarily returning page-specific token to frontend so frontend can complete the connect request.
      // In production, this can also be stored or selected directly.
      accessToken: page.access_token, 
    }));
  }

  @Post('facebook/connect')
  @ApiOperation({ summary: 'Link a selected Facebook page to the enterprise account' })
  async connectPage(
    @CurrentUser('sub') userId: string,
    @Body() input: SocialPageConnectInputDto,
  ): Promise<SocialPageDto> {
    const enterpriseId = await this.getEnterpriseId(userId);
    return this.commandBus.execute(new SocialPageConnectCommand(enterpriseId, input));
  }

  @Post('facebook/refresh-token')
  @ApiOperation({ summary: 'Refresh Facebook page access token using user credentials' })
  async refreshToken(
    @CurrentUser('sub') userId: string,
    @Body('socialPageId') socialPageId: string,
    @Body('accessToken') userAccessToken: string,
  ): Promise<SocialPageDto> {
    const enterpriseId = await this.getEnterpriseId(userId);
    return this.commandBus.execute(new SocialPageRefreshTokenCommand(socialPageId, enterpriseId, userAccessToken));
  }
}
