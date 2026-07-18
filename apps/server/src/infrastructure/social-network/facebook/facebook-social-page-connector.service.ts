import { Injectable } from '@nestjs/common';
import { FacebookTokenService } from './facebook-token.service';
import { ESocialPlatformCode } from '@/core/enums';
import {
  ISocialPageConnector,
  ISocialPageAccount,
  ISocialPageDetails,
} from '@/core/interfaces';

@Injectable()
export class FacebookSocialPageConnectorService
  implements ISocialPageConnector
{
  constructor(private readonly tokenService: FacebookTokenService) {}

  getPlatformCode(): ESocialPlatformCode {
    return ESocialPlatformCode.FACEBOOK;
  }

  async exchangeCodeForToken(
    code: string,
    redirectUri: string,
  ): Promise<string> {
    return this.tokenService.exchangeCodeForUserToken(code, redirectUri);
  }

  async exchangeForLongLivedToken(token: string): Promise<string> {
    return this.tokenService.exchangeUserTokenForLongLivedToken(token);
  }

  async getUserAccounts(token: string): Promise<ISocialPageAccount[]> {
    const accounts = await this.tokenService.getUserAccounts(token);
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
    const details = await this.tokenService.getPageDetails(
      pageToken,
      pageId,
    );
    return {
      id: details.id,
      name: details.name,
      accessToken: details.access_token,
      pictureUrl: details.picture?.data?.url ?? null,
      followerCount: details.fan_count ?? null,
    };
  }
}
