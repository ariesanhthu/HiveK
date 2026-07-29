import { Injectable, Logger } from '@nestjs/common';
import { ISocialPublisher } from '@/core/interfaces';
import { InstagramGraphApiClient } from './instagram-graph-api.client';

@Injectable()
export class InstagramPublisherService implements ISocialPublisher {
  private readonly logger = new Logger(InstagramPublisherService.name);
  private readonly maxCaptionLength = 2200;
  private readonly minMediaCount = 1;
  private readonly maxMediaCount = 10;
  private readonly imagePollMaxAttempts = 15; // ~30 seconds (images process fast)
  private readonly videoPollMaxAttempts = 60; // ~120 seconds (videos may take longer)
  private readonly pollDelayMs = 2000;

  constructor(private readonly apiClient: InstagramGraphApiClient) {}

  async publishPost(params: {
    pageToken: string;
    pageId: string;
    content: string;
    mediaUrls: string[];
  }): Promise<{ platformPostId: string }> {
    const { pageToken, pageId, content, mediaUrls } = params;

    // Instagram does NOT support text-only posts — at least 1 media file required
    if (!mediaUrls || mediaUrls.length < this.minMediaCount) {
      throw new Error(
        'Instagram requires at least one image or video. Text-only posts are not supported.',
      );
    }

    // Validate max caption length
    if (content.length > this.maxCaptionLength) {
      throw new Error(
        `Instagram caption exceeds maximum length of ${this.maxCaptionLength} characters (got ${content.length})`,
      );
    }

    // Validate max media count
    if (mediaUrls.length > this.maxMediaCount) {
      throw new Error(
        `Instagram carousel supports maximum ${this.maxMediaCount} items (got ${mediaUrls.length})`,
      );
    }

    // Route based on media count and type
    if (mediaUrls.length === 1) {
      return this.publishSingleMedia(pageToken, pageId, content, mediaUrls[0]);
    }

    // 2-10 media items → carousel
    return this.publishCarousel(pageToken, pageId, content, mediaUrls);
  }

  private detectMediaType(url: string): 'IMAGE' | 'VIDEO' {
    const lower = url.toLowerCase();
    if (
      lower.endsWith('.mp4') ||
      lower.endsWith('.mov') ||
      lower.includes('video')
    ) {
      return 'VIDEO';
    }
    return 'IMAGE';
  }

  /**
   * Publish a single image or video post (3-step container model).
   *
   * Step 1: Create media container
   * Step 2: Poll container status until FINISHED
   * Step 3: Publish container
   */
  private async publishSingleMedia(
    pageToken: string,
    igUserId: string,
    caption: string,
    mediaUrl: string,
  ): Promise<{ platformPostId: string }> {
    const mediaType = this.detectMediaType(mediaUrl);

    // Step 1: Create container
    const containerParams: Record<string, string | undefined> = {
      access_token: pageToken,
      caption,
    };

    if (mediaType === 'IMAGE') {
      containerParams['image_url'] = mediaUrl;
    } else {
      containerParams['media_type'] = 'REELS';
      containerParams['video_url'] = mediaUrl;
    }

    const container = await this.apiClient.createMediaContainer(
      igUserId,
      containerParams,
    );
    this.logger.log(
      `Created Instagram ${mediaType} container: ${container.id}`,
    );

    // Step 2: Poll container status
    const maxAttempts =
      mediaType === 'VIDEO'
        ? this.videoPollMaxAttempts
        : this.imagePollMaxAttempts;
    await this.waitForContainerReady(container.id, pageToken, maxAttempts);

    // Step 3: Publish container
    const result = await this.apiClient.publishContainer(
      igUserId,
      container.id,
      pageToken,
    );
    this.logger.log(`Published Instagram ${mediaType} post: ${result.id}`);
    return { platformPostId: result.id };
  }

  /**
   * Publish a carousel post (2-10 items, mixed image/video).
   *
   * Step 1: For each item, create a child container (no caption, is_carousel_item=true)
   * Step 2: Poll all child containers until ALL FINISHED
   * Step 3: Create parent CAROUSEL container linking all children
   * Step 4: Poll parent container status
   * Step 5: Publish parent container
   */
  private async publishCarousel(
    pageToken: string,
    igUserId: string,
    caption: string,
    mediaUrls: string[],
  ): Promise<{ platformPostId: string }> {
    // Step 1: Create child containers (no caption on children)
    const childContainerIds: string[] = [];
    for (const url of mediaUrls) {
      const mediaType = this.detectMediaType(url);
      const childParams: Record<string, string | undefined> = {
        access_token: pageToken,
        is_carousel_item: 'true',
      };

      if (mediaType === 'IMAGE') {
        childParams['image_url'] = url;
      } else {
        childParams['video_url'] = url;
      }

      const child = await this.apiClient.createMediaContainer(
        igUserId,
        childParams,
      );
      childContainerIds.push(child.id);
      this.logger.log(
        `Created carousel child container: ${child.id} (${mediaType})`,
      );
    }

    // Step 2: Poll ALL child containers until FINISHED
    for (const childId of childContainerIds) {
      await this.waitForContainerReady(
        childId,
        pageToken,
        this.videoPollMaxAttempts,
      );
    }

    // Step 3: Create parent CAROUSEL container
    const parentParams: Record<string, string | string[] | undefined> = {
      access_token: pageToken,
      media_type: 'CAROUSEL',
      children: childContainerIds.join(','),
      caption,
    };
    const parent = await this.apiClient.createMediaContainer(
      igUserId,
      parentParams,
    );
    this.logger.log(`Created carousel parent container: ${parent.id}`);

    // Step 4: Poll parent container status
    await this.waitForContainerReady(
      parent.id,
      pageToken,
      this.imagePollMaxAttempts,
    );

    // Step 5: Publish parent
    const result = await this.apiClient.publishContainer(
      igUserId,
      parent.id,
      pageToken,
    );
    this.logger.log(`Published carousel post: ${result.id}`);
    return { platformPostId: result.id };
  }

  /**
   * Poll the container status until it resolves to FINISHED, FAILED, or EXPIRED.
   * Required for all Instagram media containers (images also processed asynchronously).
   */
  private async waitForContainerReady(
    containerId: string,
    accessToken: string,
    maxAttempts: number,
  ): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.apiClient.getContainerStatus(
        containerId,
        accessToken,
      );

      switch (status.status_code) {
        case 'FINISHED':
          return;
        case 'FAILED':
          throw new Error(
            `Instagram container processing failed: ${status.error_message || 'Unknown error'}`,
          );
        case 'EXPIRED':
          throw new Error(
            'Instagram container expired before publishing (24h TTL)',
          );
        case 'IN_PROGRESS':
          await this.sleep(this.pollDelayMs);
          continue;
      }
    }

    throw new Error(
      `Instagram container processing timed out after ${(maxAttempts * this.pollDelayMs) / 1000}s`,
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
