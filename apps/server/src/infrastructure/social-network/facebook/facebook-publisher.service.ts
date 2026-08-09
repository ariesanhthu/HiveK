import { Injectable } from '@nestjs/common';
import { ISocialPublisher } from '@/core/interfaces';
import { FacebookGraphApiClient } from './facebook-graph-api.client';

@Injectable()
export class FacebookPublisherService implements ISocialPublisher {
  constructor(private readonly apiClient: FacebookGraphApiClient) {}

  async publishPost(params: {
    pageToken: string;
    pageId: string;
    content: string;
    mediaUrls: string[];
  }): Promise<{ platformPostId: string }> {
    let platformPostId = '';

    if (params.mediaUrls.length === 0) {
      // Text post
      platformPostId = await this.apiClient.publishTextPost(
        params.pageToken,
        params.pageId,
        params.content,
      );
    } else if (params.mediaUrls.length === 1) {
      // Single photo post
      platformPostId = await this.apiClient.publishPhotoPost(
        params.pageToken,
        params.pageId,
        params.content,
        params.mediaUrls[0],
      );
    } else {
      // Multi photo post
      platformPostId = await this.apiClient.publishMultiPhotoPost(
        params.pageToken,
        params.pageId,
        params.content,
        params.mediaUrls,
      );
    }

    return { platformPostId };
  }
}
