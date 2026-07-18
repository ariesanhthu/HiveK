import { Injectable } from '@nestjs/common';
import { ESocialPlatformCode } from '@/core/enums';
import {
  ISocialPageConnector,
  ISocialPageAccount,
  ISocialPageDetails,
} from '@/core/interfaces';
import { InstagramGraphApiClient } from './instagram-graph-api.client';

@Injectable()
export class InstagramSocialPageConnectorService implements ISocialPageConnector {
  constructor(private readonly apiClient: InstagramGraphApiClient) {}

  getPlatformCode(): ESocialPlatformCode {
    return ESocialPlatformCode.INSTAGRAM;
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

  /**
   * Discover Instagram Business Accounts linked to the user's Facebook Pages.
   * Instagram does not have a "pages" concept like Facebook;
   * instead, it links Instagram Business Accounts to Facebook Pages.
   *
   * Uses the optimized batch query:
   *   GET /me/accounts?fields=id,name,instagram_business_account{id,name,username,profile_picture_url}
   *
   * Each Instagram Business Account becomes a separate "page" entry.
   * The access token is the Facebook User Token (scoped to Instagram).
   */
  async getUserAccounts(token: string): Promise<ISocialPageAccount[]> {
    const igAccounts = await this.apiClient.discoverInstagramAccounts(token);
    return igAccounts.map((acct) => ({
      id: acct.id,
      name: acct.name || acct.username || acct.id,
      accessToken: token, // Facebook User Token reused for Instagram API calls
    }));
  }

  /**
   * Fetch detailed information about a specific Instagram Business Account.
   * Calls GET /{ig-user-id}?fields=id,name,username,profile_picture_url,followers_count
   */
  async getPageDetails(
    pageToken: string,
    pageId: string,
  ): Promise<ISocialPageDetails> {
    const details = await this.apiClient.getBusinessAccountDetails(
      pageId,
      pageToken,
    );
    return {
      id: details.id,
      name: details.name || details.username || details.id,
      accessToken: pageToken,
      pictureUrl: details.profile_picture_url ?? null,
      followerCount: details.followers_count ?? null,
    };
  }
}
