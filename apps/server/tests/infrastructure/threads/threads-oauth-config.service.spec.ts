import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ThreadsOAuthConfigService } from '@/infrastructure/social-network/threads/threads-oauth-config.service';

describe('ThreadsOAuthConfigService', () => {
  let service: ThreadsOAuthConfigService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    configService = {
      get: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThreadsOAuthConfigService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<ThreadsOAuthConfigService>(ThreadsOAuthConfigService);
  });

  describe('clientId', () => {
    it('should return app id from config', () => {
      configService.get.mockReturnValue('test-app-id');
      expect(service.clientId).toBe('test-app-id');
    });

    it('should return empty string when not configured', () => {
      configService.get.mockReturnValue('');
      expect(service.clientId).toBe('');
    });
  });

  describe('clientSecret', () => {
    it('should return app secret from config', () => {
      configService.get.mockReturnValue('test-secret');
      expect(service.clientSecret).toBe('test-secret');
    });
  });

  describe('redirectUri', () => {
    it('should return callback url from config', () => {
      configService.get.mockReturnValue('https://example.com/callback');
      expect(service.redirectUri).toBe('https://example.com/callback');
    });
  });

  describe('scopes', () => {
    it('should return required OAuth scopes', () => {
      expect(service.scopes).toEqual(['threads_basic', 'threads_content_publish']);
    });
  });

  describe('buildAuthUrl', () => {
    it('should build correct Threads OAuth URL', () => {
      configService.get
        .mockReturnValueOnce('app-id-123')
        .mockReturnValueOnce('https://callback')
        .mockReturnValueOnce('secret-123');

      const url = service.buildAuthUrl('test-state-jwt');

      const parsed = new URL(url);
      const qs = new URLSearchParams(parsed.search);

      expect(qs.get('client_id')).toBe('app-id-123');
      expect(qs.get('redirect_uri')).toBe('https://callback');
      expect(qs.get('scope')).toContain('threads_basic');
      expect(qs.get('scope')).toContain('threads_content_publish');
      expect(qs.get('response_type')).toBe('code');
      expect(qs.get('state')).toBe('test-state-jwt');
    });
  });
});