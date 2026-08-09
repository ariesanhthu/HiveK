import { Injectable, Inject, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { isAxiosError, AxiosResponse } from 'axios';
import { errorMessage } from '@/shared/utils/error.util';
import {
  CACHE_SERVICE,
  type ICacheService,
} from '@/application/interfaces/cache.interface';
import {
  ShortLivedTokenResponse,
  LongLivedTokenResponse,
  TokenRefreshResponse,
  InstagramBusinessAccount,
  FacebookAccountsResponse,
  InstagramAccountDetails,
  ContainerCreationResponse,
  ContainerStatusResponse,
  PublishResponse,
  BusinessUsageHeader,
} from './instagram-api.types';

@Injectable()
export class InstagramGraphApiClient {
  private readonly logger = new Logger(InstagramGraphApiClient.name);
  private readonly baseUrl = 'https://graph.facebook.com/v25.0';
  private readonly appId: string;
  private readonly appSecret: string;

  // Exponential backoff config for rate limits
  private readonly maxRetries = 5;
  private readonly initialBackoffMs = 1000;
  private readonly maxBackoffMs = 16000;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICacheService,
  ) {
    this.appId = this.configService.get<string>('FACEBOOK_APP_ID') || '';
    this.appSecret =
      this.configService.get<string>('FACEBOOK_APP_SECRET') || '';
  }

  /**
   * Execute an API call with exponential backoff retry on 429 (rate limit).
   * Also tracks X-Business-Use-Case-Usage headers in Redis after each success.
   */
  private async executeWithRetry<T>(
    apiCall: () => Promise<AxiosResponse<T>>,
    context: string,
    igUserId?: string,
  ): Promise<AxiosResponse<T>> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await apiCall();

        // Track rate limit usage from response headers
        if (igUserId && response.headers) {
          await this.trackRateLimit(igUserId, response.headers);
        }

        return response;
      } catch (error) {
        lastError = error;

        if (isAxiosError(error) && error.response?.status === 429) {
          if (attempt < this.maxRetries) {
            const delayMs = Math.min(
              this.initialBackoffMs * Math.pow(2, attempt) +
                Math.random() * 500,
              this.maxBackoffMs,
            );
            this.logger.warn(
              `[Instagram API - ${context}] Rate limited (429). ` +
                `Retry ${attempt + 1}/${this.maxRetries} in ${Math.round(delayMs)}ms...`,
            );
            await this.sleep(delayMs);
            continue;
          }
          this.logger.error(
            `[Instagram API - ${context}] Max retries (${this.maxRetries}) exhausted on 429.`,
          );
        } else {
          // Non-429 error — don't retry
          break;
        }
      }
    }

    // If we got here, all retries failed or it was a non-retryable error
    this.handleError(lastError, context);
  }

  /**
   * Track Instagram API rate limit usage from response headers in Redis.
   * Uses the X-Business-Use-Case-Usage header value.
   */
  private async trackRateLimit(
    igUserId: string,
    headers: Record<string, unknown>,
  ): Promise<void> {
    try {
      const usage = this.extractRateUsage(headers);
      if (usage) {
        const key = `instagram:rate:${igUserId}`;
        await this.cacheService.set(key, JSON.stringify(usage), 3600); // 1h TTL
      }
    } catch {
      // Best-effort tracking — don't let cache failures propagate
    }
  }

  private handleError(error: unknown, context: string): never {
    if (isAxiosError(error)) {
      this.logger.error(
        `[Instagram API Error - ${context}] Status: ${error.response?.status}, Data: ${JSON.stringify(error.response?.data)}`,
      );
      throw new Error(
        `Instagram API Error (${context}): ${errorMessage(error.response?.data || error.message)}`,
      );
    }
    this.logger.error(
      `[Instagram API Error - ${context}] Non-Axios Error: ${errorMessage(error)}`,
    );
    throw error as Error;
  }

  private extractRateUsage(
    headers: Record<string, unknown>,
  ): BusinessUsageHeader | null {
    const usage = headers['x-business-use-case-usage'];
    if (usage && typeof usage === 'string') {
      try {
        return JSON.parse(usage) as BusinessUsageHeader;
      } catch {
        return null;
      }
    }
    return null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ─── OAuth (Facebook endpoints) ───

  /**
   * Exchange an OAuth authorization code for a short-lived user access token.
   * POST https://graph.facebook.com/v25.0/oauth/access_token
   */
  async exchangeCodeForToken(
    redirectUri: string,
    code: string,
  ): Promise<ShortLivedTokenResponse> {
    const response = await this.executeWithRetry(
      () =>
        firstValueFrom(
          this.httpService.post<ShortLivedTokenResponse>(
            `${this.baseUrl}/oauth/access_token`,
            null,
            {
              params: {
                client_id: this.appId,
                client_secret: this.appSecret,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
                code,
              },
            },
          ),
        ),
      'exchangeCodeForToken',
    );
    return response.data;
  }

  /**
   * Exchange a short-lived token for a long-lived Facebook User Token (60 days).
   * GET https://graph.facebook.com/v25.0/oauth/access_token?grant_type=fb_exchange_token
   */
  async exchangeForLongLivedToken(
    accessToken: string,
  ): Promise<LongLivedTokenResponse> {
    const response = await this.executeWithRetry(
      () =>
        firstValueFrom(
          this.httpService.get<LongLivedTokenResponse>(
            `${this.baseUrl}/oauth/access_token`,
            {
              params: {
                grant_type: 'fb_exchange_token',
                client_id: this.appId,
                client_secret: this.appSecret,
                fb_exchange_token: accessToken,
              },
            },
          ),
        ),
      'exchangeForLongLivedToken',
    );
    return response.data;
  }

  /**
   * Refresh a long-lived Facebook User Token.
   * GET https://graph.facebook.com/v25.0/oauth/access_token?grant_type=fb_exchange_token
   */
  async refreshToken(accessToken: string): Promise<TokenRefreshResponse> {
    const response = await this.executeWithRetry(
      () =>
        firstValueFrom(
          this.httpService.get<TokenRefreshResponse>(
            `${this.baseUrl}/oauth/access_token`,
            {
              params: {
                grant_type: 'fb_exchange_token',
                client_secret: this.appSecret,
                fb_exchange_token: accessToken,
              },
            },
          ),
        ),
      'refreshToken',
    );
    return response.data;
  }

  // ─── Account Discovery ───

  /**
   * Discover linked Instagram Business Accounts from the user's Facebook Pages.
   * GET /me/accounts?fields=id,name,instagram_business_account{id,name,username,profile_picture_url}
   */
  async discoverInstagramAccounts(
    accessToken: string,
  ): Promise<InstagramBusinessAccount[]> {
    console.log('access token', accessToken);
    const response = await this.executeWithRetry(
      () =>
        firstValueFrom(
          this.httpService.get<FacebookAccountsResponse>(
            `${this.baseUrl}/me/accounts`,
            {
              params: {
                fields:
                  'id,name,instagram_business_account{id,name,username,profile_picture_url}',
                access_token: accessToken,
              },
            },
          ),
        ),
      'discoverInstagramAccounts',
    );
    const accounts: InstagramBusinessAccount[] = [];
    console.log(response.data);
    for (const page of response.data.data) {
      if (page.instagram_business_account) {
        console.log('account', page.instagram_business_account);
        accounts.push(page.instagram_business_account);
      }
    }
    return accounts;
  }

  /**
   * Get details for a specific Instagram Business Account.
   * GET /{ig-user-id}?fields=id,name,username,profile_picture_url,followers_count,media_count
   */
  async getBusinessAccountDetails(
    igUserId: string,
    accessToken: string,
  ): Promise<InstagramAccountDetails> {
    const response = await this.executeWithRetry(
      () =>
        firstValueFrom(
          this.httpService.get<InstagramAccountDetails>(
            `${this.baseUrl}/${igUserId}`,
            {
              params: {
                fields:
                  'id,name,username,profile_picture_url,followers_count,media_count',
                access_token: accessToken,
              },
            },
          ),
        ),
      'getBusinessAccountDetails',
      igUserId,
    );
    return response.data;
  }

  // ─── Publishing (3-step Container Model) ───

  /**
   * Step 1: Create a media container.
   * POST /{ig-user-id}/media
   *
   * Supported container types:
   * - IMAGE: { image_url, caption? }
   * - VIDEO: { media_type: 'VIDEO'|'REELS', video_url, caption? }
   * - STORIES: { media_type: 'STORIES', image_url|video_url }
   * - CAROUSEL children: { is_carousel_item: true, image_url|video_url }
   * - CAROUSEL parent: { media_type: 'CAROUSEL', children: [...], caption? }
   */
  async createMediaContainer(
    igUserId: string,
    params: Record<string, string | string[] | boolean | undefined>,
  ): Promise<ContainerCreationResponse> {
    // Convert boolean to string for API
    const queryParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        queryParams[key] = String(value);
      }
    }
    const response = await this.executeWithRetry(
      () =>
        firstValueFrom(
          this.httpService.post<ContainerCreationResponse>(
            `${this.baseUrl}/${igUserId}/media`,
            null,
            { params: queryParams },
          ),
        ),
      'createMediaContainer',
      igUserId,
    );
    return response.data;
  }

  /**
   * Step 2: Poll the processing status of a media container.
   * GET /{container-id}?fields=status_code
   */
  async getContainerStatus(
    containerId: string,
    accessToken: string,
  ): Promise<ContainerStatusResponse> {
    const response = await this.executeWithRetry(
      () =>
        firstValueFrom(
          this.httpService.get<ContainerStatusResponse>(
            `${this.baseUrl}/${containerId}`,
            {
              params: {
                fields: 'status_code',
                access_token: accessToken,
              },
            },
          ),
        ),
      'getContainerStatus',
    );
    return response.data;
  }

  /**
   * Step 3: Publish a processed media container to the Instagram feed.
   * POST /{ig-user-id}/media_publish?creation_id={container-id}
   */
  async publishContainer(
    igUserId: string,
    creationId: string,
    accessToken: string,
  ): Promise<PublishResponse> {
    const response = await this.executeWithRetry(
      () =>
        firstValueFrom(
          this.httpService.post<PublishResponse>(
            `${this.baseUrl}/${igUserId}/media_publish`,
            null,
            {
              params: {
                creation_id: creationId,
                access_token: accessToken,
              },
            },
          ),
        ),
      'publishContainer',
      igUserId,
    );
    return response.data;
  }

  // ─── Rate Limit Monitoring ───

  /**
   * Extract X-Business-Use-Case-Usage from the last response.
   * Call this after any API request to track rate limits.
   */
  getRateLimitUsage(
    headers: Record<string, unknown>,
  ): BusinessUsageHeader | null {
    return this.extractRateUsage(headers);
  }
}
