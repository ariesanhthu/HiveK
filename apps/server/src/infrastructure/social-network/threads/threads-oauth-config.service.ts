import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ThreadsOAuthConfigService {
  constructor(private readonly configService: ConfigService) {}

  /** Threads App ID from Meta Developer Console */
  get clientId(): string {
    return this.configService.get<string>('THREADS_APP_ID') || '';
  }

  /** Threads App Secret from Meta Developer Console */
  get clientSecret(): string {
    return this.configService.get<string>('THREADS_APP_SECRET') || '';
  }

  /** OAuth callback URL registered in Meta Developer Console */
  get redirectUri(): string {
    return this.configService.get<string>('THREADS_CALLBACK_URL') || '';
  }

  /** Required OAuth scopes for posting */
  get scopes(): string[] {
    return ['threads_basic', 'threads_content_publish'];
  }

  /**
   * Build the Threads OAuth authorization URL.
   * https://threads.net/oauth/authorize?client_id={app-id}&redirect_uri={callback}&scope=...&response_type=code&state={jwt}
   */
  buildAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(','),
      response_type: 'code',
      state,
    });
    return `https://threads.net/oauth/authorize?${params.toString()}`;
  }
}
