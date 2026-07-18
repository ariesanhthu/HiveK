import { Test, TestingModule } from '@nestjs/testing';
import { ThreadsPublisherService } from '@/infrastructure/social-network/threads/threads-publisher.service';
import { ThreadsGraphApiClient } from '@/infrastructure/social-network/threads/threads-graph-api.client';
import { Logger } from '@nestjs/common';

describe('ThreadsPublisherService', () => {
  let service: ThreadsPublisherService;
  let apiClient: jest.Mocked<ThreadsGraphApiClient>;
  let loggerSpy: jest.Spied<jest.Mocked<Logger>>;

  beforeEach(async () => {
    apiClient = {
      createMediaContainer: jest.fn(),
      getContainerStatus: jest.fn(),
      publishContainer: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThreadsPublisherService,
        { provide: ThreadsGraphApiClient, useValue: apiClient },
      ],
    }).compile();

    service = module.get<ThreadsPublisherService>(ThreadsPublisherService);
    loggerSpy = jest.spyOn(service['logger'], 'warn').mockImplementation(() => {});
  });

  describe('publishPost', () => {
    it('should throw when content exceeds 500 characters', async () => {
      const longContent = 'a'.repeat(501);
      await expect(
        service.publishPost({
          pageToken: 'token',
          pageId: '123',
          content: longContent,
          mediaUrls: [],
        }),
      ).rejects.toThrow('Threads content exceeds maximum length of 500 characters');
    });

    it('should publish a TEXT post when no media is provided', async () => {
      apiClient.createMediaContainer.mockResolvedValue({ id: 'container-1' } as any);
      apiClient.publishContainer.mockResolvedValue({ id: 'media-1' } as any);

      const result = await service.publishPost({
        pageToken: 'token',
        pageId: '123',
        content: 'Hello Threads',
        mediaUrls: [],
      });

      expect(result.platformPostId).toBe('media-1');
      expect(apiClient.createMediaContainer).toHaveBeenCalledWith('123', {
        media_type: 'TEXT',
        text: 'Hello Threads',
        access_token: 'token',
      });
    });

    it('should publish an IMAGE post when one image URL is provided', async () => {
      apiClient.createMediaContainer.mockResolvedValue({ id: 'container-1' } as any);
      apiClient.publishContainer.mockResolvedValue({ id: 'media-1' } as any);

      const result = await service.publishPost({
        pageToken: 'token',
        pageId: '123',
        content: 'Image post',
        mediaUrls: ['https://cdn.example.com/image.jpg'],
      });

      expect(result.platformPostId).toBe('media-1');
      expect(apiClient.createMediaContainer).toHaveBeenCalledWith('123', {
        media_type: 'IMAGE',
        text: 'Image post',
        image_url: 'https://cdn.example.com/image.jpg',
        access_token: 'token',
      });
    });

    it('should publish a VIDEO post with polling when one video URL is provided', async () => {
      apiClient.createMediaContainer.mockResolvedValue({ id: 'container-1' } as any);
      apiClient.getContainerStatus
        .mockResolvedValueOnce({ id: 'container-1', status_code: 'IN_PROGRESS' } as any)
        .mockResolvedValueOnce({ id: 'container-1', status_code: 'FINISHED' } as any);
      apiClient.publishContainer.mockResolvedValue({ id: 'media-1' } as any);

      const result = await service.publishPost({
        pageToken: 'token',
        pageId: '123',
        content: 'Video post',
        mediaUrls: ['https://cdn.example.com/video.mp4'],
      });

      expect(result.platformPostId).toBe('media-1');
      expect(apiClient.getContainerStatus).toHaveBeenCalledWith('container-1');
      expect(apiClient.publishContainer).toHaveBeenCalledWith('123', 'container-1');
    });

    it('should throw when video processing FAILED', async () => {
      apiClient.createMediaContainer.mockResolvedValue({ id: 'container-1' } as any);
      apiClient.getContainerStatus.mockResolvedValue({
        id: 'container-1',
        status_code: 'FAILED',
        error_message: 'Transcoding error',
      } as any);

      await expect(
        service.publishPost({
          pageToken: 'token',
          pageId: '123',
          content: 'Video post',
          mediaUrls: ['https://cdn.example.com/video.mp4'],
        }),
      ).rejects.toThrow('Threads video processing failed: Transcoding error');
    });

    it('should throw when video container EXPIRED', async () => {
      apiClient.createMediaContainer.mockResolvedValue({ id: 'container-1' } as any);
      apiClient.getContainerStatus.mockResolvedValue({
        id: 'container-1',
        status_code: 'EXPIRED',
      } as any);

      await expect(
        service.publishPost({
          pageToken: 'token',
          pageId: '123',
          content: 'Video post',
          mediaUrls: ['https://cdn.example.com/video.mp4'],
        }),
      ).rejects.toThrow('Threads container expired');
    });

    it('should wrap multiple media items as text post with warning', async () => {
      apiClient.createMediaContainer.mockResolvedValue({ id: 'container-1' } as any);
      apiClient.publishContainer.mockResolvedValue({ id: 'media-1' } as any);

      const result = await service.publishPost({
        pageToken: 'token',
        pageId: '123',
        content: 'Multi post',
        mediaUrls: ['https://cdn.example.com/img1.jpg', 'https://cdn.example.com/img2.jpg'],
      });

      // Should fall back to text post when multiple media items are provided
      expect(result.platformPostId).toBe('media-1');
      expect(apiClient.createMediaContainer).toHaveBeenCalledWith('123', {
        media_type: 'TEXT',
        text: 'Multi post',
        access_token: 'token',
      });
    });
  });
});