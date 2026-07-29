import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  IFacebookOAuthTokenResponse,
  IFacebookPageAccountsResponse,
  IFacebookPageDetails,
  IFacebookPostResponse,
  IFacebookPageAccount,
} from './facebook-api.types';
import { isAxiosError } from 'axios';
import { errorMessage } from '@/shared/utils/error.util';

@Injectable()
export class FacebookGraphApiClient {
  private readonly logger = new Logger(FacebookGraphApiClient.name);
  private readonly baseUrl: string;
  private readonly appId: string;
  private readonly appSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('FACEBOOK_GRAPH_API_URL') ||
      'https://graph.facebook.com/v19.0';
    this.appId = this.configService.get<string>('FACEBOOK_APP_ID') || '';
    this.appSecret =
      this.configService.get<string>('FACEBOOK_APP_SECRET') || '';
  }

  private handleError(error: unknown, context: string): never {
    if (isAxiosError(error)) {
      this.logger.error(
        `[Facebook API Error - ${context}] Status: ${error.response?.status}, Data: ${JSON.stringify(error.response?.data)}`,
      );
      throw new Error(
        `Facebook API Error (${context}): ${errorMessage(error.response?.data || error.message)}`,
      );
    }
    this.logger.error(
      `[Facebook API Error - ${context}] Non-Axios Error: ${errorMessage(error)}`,
    );
    throw error as Error;
  }

  async publishTextPost(
    pageToken: string,
    pageId: string,
    message: string,
  ): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<IFacebookPostResponse>(
          `${this.baseUrl}/${pageId}/feed`,
          { message },
          { params: { access_token: pageToken } },
        ),
      );
      return response.data.id;
    } catch (error) {
      this.handleError(error, 'publishTextPost');
    }
  }

  async publishPhotoPost(
    pageToken: string,
    pageId: string,
    message: string,
    imageUrl: string,
  ): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<IFacebookPostResponse>(
          `${this.baseUrl}/${pageId}/photos`,
          { url: imageUrl, caption: message },
          { params: { access_token: pageToken } },
        ),
      );
      return response.data.id;
    } catch (error) {
      this.handleError(error, 'publishPhotoPost');
    }
  }

  async publishMultiPhotoPost(
    pageToken: string,
    pageId: string,
    message: string,
    imageUrls: string[],
  ): Promise<string> {
    try {
      // Step 1: Upload photos as unpublished, returning attachment IDs
      const attachedMedia = await Promise.all(
        imageUrls.map(async (url) => {
          const res = await firstValueFrom(
            this.httpService.post<{ id: string }>(
              `${this.baseUrl}/${pageId}/photos`,
              { url, published: false },
              { params: { access_token: pageToken } },
            ),
          );
          return { media_fbid: res.data.id };
        }),
      );

      // Step 2: Publish feed post linking those media attachments
      const response = await firstValueFrom(
        this.httpService.post<IFacebookPostResponse>(
          `${this.baseUrl}/${pageId}/feed`,
          { message, attached_media: attachedMedia },
          { params: { access_token: pageToken } },
        ),
      );
      return response.data.id;
    } catch (error) {
      this.handleError(error, 'publishMultiPhotoPost');
    }
  }

  async replyToComment(
    pageToken: string,
    commentId: string,
    message: string,
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/${commentId}/comments`,
          { message },
          { params: { access_token: pageToken } },
        ),
      );
    } catch (error) {
      this.handleError(error, 'replyToComment');
    }
  }

  async exchangeCodeForUserToken(
    code: string,
    redirectUri: string,
  ): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<IFacebookOAuthTokenResponse>(
          `${this.baseUrl}/oauth/access_token`,
          {
            params: {
              client_id: this.appId,
              client_secret: this.appSecret,
              redirect_uri: redirectUri,
              code,
            },
          },
        ),
      );
      return response.data.access_token;
    } catch (error) {
      this.handleError(error, 'exchangeCodeForUserToken');
    }
  }

  async exchangeUserTokenForLongLivedToken(userToken: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<IFacebookOAuthTokenResponse>(
          `${this.baseUrl}/oauth/access_token`,
          {
            params: {
              grant_type: 'fb_exchange_token',
              client_id: this.appId,
              client_secret: this.appSecret,
              fb_exchange_token: userToken,
            },
          },
        ),
      );
      return response.data.access_token;
    } catch (error) {
      this.handleError(error, 'exchangeUserTokenForLongLivedToken');
    }
  }

  async getUserAccounts(userToken: string): Promise<IFacebookPageAccount[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<IFacebookPageAccountsResponse>(
          `${this.baseUrl}/me/accounts`,
          { params: { access_token: userToken } },
        ),
      );
      return response.data.data;
    } catch (error) {
      this.handleError(error, 'getUserAccounts');
    }
  }

  async getPageDetails(
    pageToken: string,
    pageId: string,
  ): Promise<IFacebookPageDetails> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<IFacebookPageDetails>(
          `${this.baseUrl}/${pageId}`,
          {
            params: {
              fields: 'id,name,access_token,picture{url},fan_count',
              access_token: pageToken,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'getPageDetails');
    }
  }
}
