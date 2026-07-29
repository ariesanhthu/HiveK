import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { isAxiosError } from 'axios';
import { errorMessage } from '@/shared/utils/error.util';
import {
  ShortLivedTokenResponse,
  LongLivedTokenResponse,
  TokenRefreshResponse,
  UserProfileResponse,
  ContainerCreationResponse,
  ContainerStatusResponse,
  PublishResponse,
  PostDeletionResponse,
} from './threads-api.types';

@Injectable()
export class ThreadsGraphApiClient {
  private readonly logger = new Logger(ThreadsGraphApiClient.name);
  private readonly baseUrl: string;
  private readonly appId: string;
  private readonly appSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = 'https://graph.threads.net/v1.0';
    this.appId = this.configService.get<string>('THREADS_APP_ID') || '';
    this.appSecret = this.configService.get<string>('THREADS_APP_SECRET') || '';
  }

  private handleError(error: unknown, context: string): never {
    if (isAxiosError(error)) {
      this.logger.error(
        `[Threads API Error - ${context}] Status: ${error.response?.status}, Data: ${JSON.stringify(error.response?.data)}`,
      );
      throw new Error(
        `Threads API Error (${context}): ${errorMessage(error.response?.data || error.message)}`,
      );
    }
    this.logger.error(
      `[Threads API Error - ${context}] Non-Axios Error: ${errorMessage(error)}`,
    );
    throw error as Error;
  }

  /**
   * Exchange an OAuth authorization code for a short-lived user access token.
   * POST https://graph.threads.net/oauth/access_token
   */
  async exchangeCodeForToken(
    redirectUri: string,
    code: string,
  ): Promise<ShortLivedTokenResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<ShortLivedTokenResponse>(
          `https://graph.threads.net/oauth/access_token`,
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
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'exchangeCodeForToken');
    }
  }

  /**
   * Exchange a short-lived token for a long-lived token (60 days).
   * GET https://graph.threads.net/access_token?grant_type=th_exchange_token
   */
  async exchangeForLongLivedToken(
    accessToken: string,
  ): Promise<LongLivedTokenResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<LongLivedTokenResponse>(
          `https://graph.threads.net/access_token`,
          {
            params: {
              grant_type: 'th_exchange_token',
              client_secret: this.appSecret,
              access_token: accessToken,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'exchangeForLongLivedToken');
    }
  }

  /**
   * Refresh a long-lived token before it expires.
   * GET https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token
   */
  async refreshToken(accessToken: string): Promise<TokenRefreshResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<TokenRefreshResponse>(
          `https://graph.threads.net/refresh_access_token`,
          {
            params: {
              grant_type: 'th_refresh_token',
              access_token: accessToken,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'refreshToken');
    }
  }

  /**
   * Get the authenticated user's Threads profile.
   * GET /v1.0/{user-id}?fields=id,username,name,threads_profile_picture_url,threads_biography
   */
  async getUserProfile(
    userId: string,
    accessToken: string,
  ): Promise<UserProfileResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<UserProfileResponse>(`${this.baseUrl}/${userId}`, {
          params: {
            fields:
              'id,username,name,threads_profile_picture_url,threads_biography',
            access_token: accessToken,
          },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'getUserProfile');
    }
  }

  /**
   * Step 1: Create a media container for a post.
   * POST /v1.0/{user-id}/threads
   */
  async createMediaContainer(
    userId: string,
    params: Record<string, string | undefined>,
  ): Promise<ContainerCreationResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<ContainerCreationResponse>(
          `${this.baseUrl}/${userId}/threads`,
          null,
          { params: { ...params, access_token: params.access_token } },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'createMediaContainer');
    }
  }

  /**
   * Step 1.5: Poll the status of a media container (required for video).
   * GET /v1.0/{container-id}?fields=status_code
   */
  async getContainerStatus(
    containerId: string,
  ): Promise<ContainerStatusResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<ContainerStatusResponse>(
          `${this.baseUrl}/${containerId}`,
          { params: { fields: 'status_code' } },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'getContainerStatus');
    }
  }

  /**
   * Step 2: Publish a media container to the user's Threads feed.
   * POST /v1.0/{user-id}/threads_publish?creation_id={container-id}
   */
  async publishContainer(
    userId: string,
    creationId: string,
    accessToken: string,
  ): Promise<PublishResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<PublishResponse>(
          `${this.baseUrl}/${userId}/threads_publish`,
          null,
          { params: { creation_id: creationId, access_token: accessToken } },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'publishContainer');
    }
  }

  /**
   * Delete a post by its media ID.
   * DELETE /v1.0/{media-id}
   */
  async deletePost(mediaId: string): Promise<PostDeletionResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.delete<PostDeletionResponse>(
          `${this.baseUrl}/${mediaId}`,
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'deletePost');
    }
  }
}
