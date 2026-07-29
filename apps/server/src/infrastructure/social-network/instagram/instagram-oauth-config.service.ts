import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InstagramOAuthConfigService {
  constructor(private readonly configService: ConfigService) {}

  /** Facebook App ID from Meta Developer Console (shared with FB integration) */
  get clientId(): string {
    return this.configService.get<string>('FACEBOOK_APP_ID') || '';
  }

  /** Facebook App Secret from Meta Developer Console (shared with FB integration) */
  get clientSecret(): string {
    return this.configService.get<string>('FACEBOOK_APP_SECRET') || '';
  }

  /** Instagram OAuth callback URL registered in Meta Developer Console */
  get redirectUri(): string {
    return this.configService.get<string>('INSTAGRAM_CALLBACK_URL') || '';
  }

  /**
   * Required OAuth scopes for Instagram posting.
   * - instagram_basic: Read profile data and linked IG accounts
   * - instagram_content_publish: Upload media and publish posts
   * - pages_show_list: List Facebook Pages (required to discover IG Business Account)
   * - pages_read_engagement: Read Page metadata (required to bridge auth gap)
   */
  get scopes(): string[] {
    // 'instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights,pages_show_list,pages_read_engagement'
    return [
      'public_profile',
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_manage_engagement', // Dành cho Facebook
      'instagram_basic', // Đọc info IG
      'instagram_content_publish', // Đăng bài IG
      'instagram_manage_comments', // Auto rep comment IG
      'instagram_manage_messages', // Auto rep inbox DM IG
    ];
  }

  /**
   * Build the Instagram OAuth authorization URL.
   * Instagram routes through Facebook Login dialog with Instagram-specific scopes.
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
