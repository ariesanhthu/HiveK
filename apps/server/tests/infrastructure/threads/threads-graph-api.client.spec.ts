import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ThreadsGraphApiClient } from '@/infrastructure/social-network/threads/threads-graph-api.client';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('ThreadsGraphApiClient', () => {
  let client: ThreadsGraphApiClient;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    httpService = {
      post: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    } as any;

    configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThreadsGraphApiClient,
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    client = module.get<ThreadsGraphApiClient>(ThreadsGraphApiClient);
  });

  function mockResponse<T>(data: T): AxiosResponse<T> {
    return {
      data,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    } as AxiosResponse<T>;
  }

  describe('exchangeCodeForToken', () => {
    it('should exchange authorization code for short-lived token', async () => {
      httpService.post.mockReturnValue(of(mockResponse({ access_token: 'short-lived-token', user_id: '12345' })));

      const result = await client.exchangeCodeForToken('auth-code', 'https://callback');

      expect(result.access_token).toBe('short-lived-token');
      expect(result.user_id).toBe('12345');
      expect(httpService.post).toHaveBeenCalled();
    });
  });

  describe('exchangeForLongLivedToken', () => {
    it('should exchange short-lived token for long-lived token', async () => {
      httpService.get.mockReturnValue(of(mockResponse({ access_token: 'long-lived-token', token_type: 'bearer', expires_in: 5183944 })));

      const result = await client.exchangeForLongLivedToken('short-lived-token');

      expect(result.access_token).toBe('long-lived-token');
      expect(result.expires_in).toBeGreaterThan(0);
    });
  });

  describe('refreshToken', () => {
    it('should refresh a long-lived token', async () => {
      httpService.get.mockReturnValue(of(mockResponse({ access_token: 'refreshed-token', token_type: 'bearer', expires_in: 5183944 })));

      const result = await client.refreshToken('long-lived-token');

      expect(result.access_token).toBe('refreshed-token');
    });
  });

  describe('getUserProfile', () => {
    it('should fetch user profile with selected fields', async () => {
      httpService.get.mockReturnValue(of(mockResponse({
        id: '12345',
        username: 'testuser',
        name: 'Test User',
        threads_profile_picture_url: 'https://example.com/pic.jpg',
        threads_biography: 'Hello world',
      })));

      const result = await client.getUserProfile('12345', 'token');

      expect(result.id).toBe('12345');
      expect(result.username).toBe('testuser');
      expect(result.threads_profile_picture_url).toBe('https://example.com/pic.jpg');
    });
  });

  describe('createMediaContainer', () => {
    it('should create a media container and return creation_id', async () => {
      httpService.post.mockReturnValue(of(mockResponse({ id: 'container-123' })));

      const result = await client.createMediaContainer('12345', {
        media_type: 'TEXT',
        text: 'Hello Threads',
        access_token: 'token',
      });

      expect(result.id).toBe('container-123');
    });
  });

  describe('getContainerStatus', () => {
    it('should return container status', async () => {
      httpService.get.mockReturnValue(of(mockResponse({ id: 'container-123', status_code: 'FINISHED' })));

      const result = await client.getContainerStatus('container-123');

      expect(result.status_code).toBe('FINISHED');
    });
  });

  describe('publishContainer', () => {
    it('should publish container and return media ID', async () => {
      httpService.post.mockReturnValue(of(mockResponse({ id: 'media-456' })));

      const result = await client.publishContainer('12345', 'container-123');

      expect(result.id).toBe('media-456');
    });
  });

  describe('deletePost', () => {
    it('should delete a post by media ID', async () => {
      httpService.delete.mockReturnValue(of(mockResponse({ success: true })));

      const result = await client.deletePost('media-456');

      expect(result.success).toBe(true);
      expect(httpService.delete).toHaveBeenCalledWith('https://graph.threads.net/v1.0/media-456');
    });
  });

  describe('error handling', () => {
    it('should throw descriptive error on HTTP failure', async () => {
      const mockError = new Error('Request failed with status code 429');
      httpService.post.mockImplementation(() => { throw mockError; });
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(client.exchangeCodeForToken('code', 'uri')).rejects.toThrow(
        'Request failed with status code 429',
      );
    });
  });
});