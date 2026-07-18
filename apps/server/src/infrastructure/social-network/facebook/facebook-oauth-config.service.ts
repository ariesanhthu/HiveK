import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookOAuthConfigService {
  constructor(private readonly configService: ConfigService) {}

  /** Facebook App ID from Meta Developer Console */
  get clientId(): string {
    return this.configService.get<string>('FACEBOOK_APP_ID') || '';
  }

  /** Facebook App Secret from Meta Developer Console */
  get clientSecret(): string {
    return this.configService.get<string>('FACEBOOK_APP_SECRET') || '';
  }

  /** Facebook OAuth callback URL registered in Meta Developer Console */
  get redirectUri(): string {
    return this.configService.get<string>('FACEBOOK_CALLBACK_URL') || '';
  }

  /** Required OAuth scopes for Facebook Page management */
  get scopes(): string[] {
    return [
      'public_profile',
      'pages_show_list',
      'pages_manage_posts',
      'pages_read_engagement',
      // 'business_management',
    ];
  }

  /**
   * Build the Facebook OAuth authorization URL.
   * https://www.facebook.com/v25.0/dialog/oauth?client_id={app-id}&redirect_uri={callback}&scope=...&response_type=code&state={jwt}
   */
  buildAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(','),
      response_type: 'code',
      state,
    });
    return `https://www.facebook.com/v25.0/dialog/oauth?${params.toString()}`;
  }
}
