import { Injectable } from '@nestjs/common';
import { ICommentReplier } from '@/core/interfaces';
import { FacebookGraphApiClient } from './facebook-graph-api.client';

@Injectable()
export class FacebookCommentReplierService implements ICommentReplier {
  constructor(private readonly apiClient: FacebookGraphApiClient) {}

  async replyToComment(params: {
    pageToken: string;
    commentId: string;
    message: string;
  }): Promise<void> {
    await this.apiClient.replyToComment(
      params.pageToken,
      params.commentId,
      params.message,
    );
  }
}
