import { Injectable } from '@nestjs/common';
import { FacebookGraphApiClient } from './facebook-graph-api.client';
import { IFacebookPageAccount, IFacebookPageDetails } from './interfaces/facebook-api.interface';

@Injectable()
export class FacebookTokenService {
  constructor(private readonly apiClient: FacebookGraphApiClient) {}

  async exchangeCodeForUserToken(code: string, redirectUri: string): Promise<string> {
    return this.apiClient.exchangeCodeForUserToken(code, redirectUri);
  }

  async exchangeUserTokenForLongLivedToken(userToken: string): Promise<string> {
    return this.apiClient.exchangeUserTokenForLongLivedToken(userToken);
  }

  async getUserAccounts(longLivedUserToken: string): Promise<IFacebookPageAccount[]> {
    return this.apiClient.getUserAccounts(longLivedUserToken);
  }

  async getPageDetails(pageToken: string, pageId: string): Promise<IFacebookPageDetails> {
    return this.apiClient.getPageDetails(pageToken, pageId);
  }
}
