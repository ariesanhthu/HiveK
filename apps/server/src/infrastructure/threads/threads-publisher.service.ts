import { Injectable, Logger } from '@nestjs/common';
import { ISocialPublisher } from '@/core/interfaces';
import { ThreadsGraphApiClient } from './threads-graph-api.client';

@Injectable()
export class ThreadsPublisherService implements ISocialPublisher {
  private readonly logger = new Logger(ThreadsPublisherService.name);
  private readonly maxContentLength = 500;
  private readonly videoPollMaxAttempts = 30; // ~60 seconds
  private readonly videoPollDelayMs = 2000;

  constructor(private readonly apiClient: ThreadsGraphApiClient) {}

  async publishPost(params: {
    pageToken: string;
    pageId: string;
    content: string;
    mediaUrls: string[];
  }): Promise<{ platformPostId: string }> {
    const { pageToken, pageId, content, mediaUrls } = params;

    // Validate content length (Threads max: 500 graphemes)
    if (content.length > this.maxContentLength) {
      throw new Error(
        `Threads content exceeds maximum length of ${this.maxContentLength} characters (got ${content.length})`,
      );
    }

    // Determine media type and create container
    const mediaType = this.detectMediaType(mediaUrls);

    if (mediaType === 'IMAGE') {
      return this.publishImagePost(pageToken, pageId, content, mediaUrls[0]);
    }

    if (mediaType === 'VIDEO') {
      return this.publishVideoPost(pageToken, pageId, content, mediaUrls[0]);
    }

    // TEXT or unsupported count — fall back to text-only
    if (mediaUrls.length > 1) {
      this.logger.warn(
        `Unsupported media count for Threads (${mediaUrls.length}). Publishing as text only.`,
      );
    }
    return this.publishTextPost(pageToken, pageId, content);
  }

  private detectMediaType(mediaUrls: string[]): 'TEXT' | 'IMAGE' | 'VIDEO' {
    if (mediaUrls.length === 0) return 'TEXT';
    if (mediaUrls.length === 1) {
      const url = mediaUrls[0].toLowerCase();
      if (
        url.endsWith('.mp4') ||
        url.endsWith('.mov') ||
        url.includes('video')
      ) {
        return 'VIDEO';
      }
      return 'IMAGE';
    }
    // Multiple media items → carousel (not yet implemented)
    return 'TEXT';
  }

  private async publishTextPost(
    pageToken: string,
    userId: string,
    content: string,
  ): Promise<{ platformPostId: string }> {
    // Step 1: Create TEXT container
    const container = await this.apiClient.createMediaContainer(userId, {
      media_type: 'TEXT',
      text: content,
      access_token: pageToken,
    });

    console.log(`Created Threads text container: ${container.id}`);

    // Step 2: Publish container
    const result = await this.apiClient.publishContainer(userId, container.id, pageToken);
    this.logger.log(`Published Threads text post: ${result.id}`);
    return { platformPostId: result.id };
  }

  private async publishImagePost(
    pageToken: string,
    userId: string,
    content: string,
    imageUrl: string,
  ): Promise<{ platformPostId: string }> {
    // Step 1: Create IMAGE container
    const container = await this.apiClient.createMediaContainer(userId, {
      media_type: 'IMAGE',
      text: content,
      image_url: imageUrl,
      access_token: pageToken,
    });

    // Step 2: Publish container
    const result = await this.apiClient.publishContainer(userId, container.id, pageToken);
    this.logger.log(`Published Threads image post: ${result.id}`);
    return { platformPostId: result.id };
  }

  private async publishVideoPost(
    pageToken: string,
    userId: string,
    content: string,
    videoUrl: string,
  ): Promise<{ platformPostId: string }> {
    // Step 1: Create VIDEO container
    const container = await this.apiClient.createMediaContainer(userId, {
      media_type: 'VIDEO',
      text: content,
      video_url: videoUrl,
      access_token: pageToken,
    });

    // Step 1.5: Poll container status until FINISHED
    await this.waitForContainerReady(container.id);

    // Step 2: Publish container
    const result = await this.apiClient.publishContainer(userId, container.id, pageToken);
    this.logger.log(`Published Threads video post: ${result.id}`);
    return { platformPostId: result.id };
  }

  /**
   * Poll the container status until it resolves to FINISHED, FAILED, or EXPIRED.
   * Required for video containers as they need transcoding time.
   */
  private async waitForContainerReady(containerId: string): Promise<void> {
    for (let attempt = 0; attempt < this.videoPollMaxAttempts; attempt++) {
      const status = await this.apiClient.getContainerStatus(containerId);

      switch (status.status_code) {
        case 'FINISHED':
          return;
        case 'FAILED':
          throw new Error(
            `Threads video processing failed: ${status.error_message || 'Unknown error'}`,
          );
        case 'EXPIRED':
          throw new Error(
            'Threads container expired before publishing (24h TTL)',
          );
        case 'IN_PROGRESS':
          // Continue polling
          await this.sleep(this.videoPollDelayMs);
          continue;
      }
    }

    throw new Error(
      `Threads video processing timed out after ${this.videoPollMaxAttempts * this.videoPollDelayMs / 1000}s`,
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}