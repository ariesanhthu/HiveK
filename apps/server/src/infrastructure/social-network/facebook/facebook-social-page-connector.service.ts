import { Injectable } from '@nestjs/common';
import { FacebookGraphApiClient } from './facebook-graph-api.client';
import { ESocialPlatformCode } from '@/core/enums';
import {
  ISocialPageConnector,
  ISocialPageAccount,
  ISocialPageDetails,
} from '@/core/interfaces';

@Injectable()
export class FacebookSocialPageConnectorService implements ISocialPageConnector {
  constructor(private readonly apiClient: FacebookGraphApiClient) {}

  getPlatformCode(): ESocialPlatformCode {
    return ESocialPlatformCode.FACEBOOK;
  }

  async exchangeCodeForToken(
    code: string,
    redirectUri: string,
  ): Promise<string> {
    return this.apiClient.exchangeCodeForUserToken(code, redirectUri);
  }

  async exchangeForLongLivedToken(token: string): Promise<string> {
    return this.apiClient.exchangeUserTokenForLongLivedToken(token);
  }

  async getUserAccounts(token: string): Promise<ISocialPageAccount[]> {
    const accounts = await this.apiClient.getUserAccounts(token);
    return accounts.map((a) => ({
      id: a.id,
      name: a.name,
      accessToken: a.access_token,
      category: a.category,
      tasks: a.tasks,
    }));
  }

  async getPageDetails(
    pageToken: string,
    pageId: string,
  ): Promise<ISocialPageDetails> {
    const details = await this.apiClient.getPageDetails(pageToken, pageId);
    return {
      id: details.id,
      name: details.name,
      accessToken: details.access_token,
      pictureUrl: details.picture?.data?.url ?? null,
      followerCount: details.fan_count ?? null,
    };
  }
}
