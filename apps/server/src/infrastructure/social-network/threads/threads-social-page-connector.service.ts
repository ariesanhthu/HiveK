import { Injectable } from '@nestjs/common';
import { ESocialPlatformCode } from '@/core/enums';
import {
  ISocialPageConnector,
  ISocialPageAccount,
  ISocialPageDetails,
} from '@/core/interfaces';
import { ThreadsGraphApiClient } from './threads-graph-api.client';

@Injectable()
export class ThreadsSocialPageConnectorService implements ISocialPageConnector {
  constructor(private readonly apiClient: ThreadsGraphApiClient) {}

  getPlatformCode(): ESocialPlatformCode {
    return ESocialPlatformCode.THREADS;
  }

  async exchangeCodeForToken(
    code: string,
    redirectUri: string,
  ): Promise<string> {
    const response = await this.apiClient.exchangeCodeForToken(
      redirectUri,
      code,
    );
    return response.access_token;
  }

  async exchangeForLongLivedToken(token: string): Promise<string> {
    const response = await this.apiClient.exchangeForLongLivedToken(token);
    return response.access_token;
  }

  async getUserAccounts(token: string): Promise<ISocialPageAccount[]> {
    // Threads is user-level (no "pages") — fetch user profile as single account
    const profile = await this.apiClient.getUserProfile('me', token);
    return [
      {
        id: profile.id,
        name: profile.name || profile.username,
        accessToken: token,
      },
    ];
  }

  async getPageDetails(
    pageToken: string,
    pageId: string,
  ): Promise<ISocialPageDetails> {
    const profile = await this.apiClient.getUserProfile(pageId, pageToken);
    return {
      id: profile.id,
      name: profile.name || profile.username,
      accessToken: pageToken,
      pictureUrl: profile.threads_profile_picture_url ?? null,
      followerCount: null, // Threads API does not expose follower count via user profile
    };
  }
}