import { Test, TestingModule } from '@nestjs/testing';
import { ThreadsSocialPageConnectorService } from '@/infrastructure/threads/threads-social-page-connector.service';
import { ThreadsGraphApiClient } from '@/infrastructure/threads/threads-graph-api.client';

describe('ThreadsSocialPageConnectorService', () => {
  let service: ThreadsSocialPageConnectorService;
  let apiClient: jest.Mocked<ThreadsGraphApiClient>;

  beforeEach(async () => {
    apiClient = {
      exchangeCodeForToken: jest.fn(),
      exchangeForLongLivedToken: jest.fn(),
      getUserProfile: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThreadsSocialPageConnectorService,
        { provide: ThreadsGraphApiClient, useValue: apiClient },
      ],
    }).compile();

    service = module.get<ThreadsSocialPageConnectorService>(ThreadsSocialPageConnectorService);
  });

  describe('getPlatformCode', () => {
    it('should return threads platform code', () => {
      expect(service.getPlatformCode()).toBe('threads');
    });
  });

  describe('exchangeCodeForToken', () => {
    it('should exchange code for short-lived token', async () => {
      apiClient.exchangeCodeForToken.mockResolvedValue({ access_token: 'short-token', user_id: '123' } as any);

      const result = await service.exchangeCodeForToken('auth-code', 'https://callback');

      expect(result).toBe('short-token');
      expect(apiClient.exchangeCodeForToken).toHaveBeenCalledWith('https://callback', 'auth-code');
    });
  });

  describe('exchangeForLongLivedToken', () => {
    it('should exchange short-lived token for long-lived token', async () => {
      apiClient.exchangeForLongLivedToken.mockResolvedValue({ access_token: 'long-token', token_type: 'bearer', expires_in: 5183944 } as any);

      const result = await service.exchangeForLongLivedToken('short-token');

      expect(result).toBe('long-token');
    });
  });

  describe('getUserAccounts', () => {
    it('should return single-entry array with user profile', async () => {
      apiClient.getUserProfile.mockResolvedValue({
        id: '12345',
        username: 'testuser',
        name: 'Test User',
        threads_profile_picture_url: 'https://example.com/pic.jpg',
        threads_biography: 'Bio',
      } as any);

      const result = await service.getUserAccounts('user-token');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('12345');
      expect(result[0].name).toBe('Test User');
      expect(result[0].accessToken).toBe('user-token');
    });
  });

  describe('getPageDetails', () => {
    it('should return mapped page details from profile', async () => {
      apiClient.getUserProfile.mockResolvedValue({
        id: '12345',
        username: 'testuser',
        name: 'Test User',
        threads_profile_picture_url: 'https://example.com/pic.jpg',
        threads_biography: 'Bio',
      } as any);

      const result = await service.getPageDetails('page-token', '12345');

      expect(result.id).toBe('12345');
      expect(result.name).toBe('Test User');
      expect(result.pictureUrl).toBe('https://example.com/pic.jpg');
      expect(result.followerCount).toBeNull();
    });
  });
});