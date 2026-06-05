import { ConfigService } from '@nestjs/config';
import { CloudinaryStorageService } from '@/infrastructure/cloudinary/cloudinary-storage.service';

// Mock Cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
    api: {
      delete_resources: jest.fn(),
    },
  },
}));

describe('CloudinaryStorageService', () => {
  let service: CloudinaryStorageService;
  let mockConfigService: any;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          CLOUDINARY_CLOUD_NAME: 'test-cloud',
          CLOUDINARY_API_KEY: 'test-key',
          CLOUDINARY_API_SECRET: 'test-secret',
          CLOUDINARY_UPLOAD_PRESET: 'hivek-uploads',
        };
        return config[key];
      }),
    };
    service = new CloudinaryStorageService(mockConfigService);
  });

  describe('extractPublicIdFromUrl', () => {
    it('should extract public_id from standard Cloudinary URL', () => {
      const url = 'https://res.cloudinary.com/test-cloud/image/upload/v123456/hivek-uploads/abc123.jpg';
      const result = service.extractPublicIdFromUrl(url);
      expect(result).toBe('hivek-uploads/abc123');
    });

    it('should return null for non-Cloudinary URL', () => {
      const url = 'https://example.com/image.jpg';
      const result = service.extractPublicIdFromUrl(url);
      expect(result).toBeNull();
    });

    it('should return null for malformed URL', () => {
      expect(service.extractPublicIdFromUrl('not-a-url')).toBeNull();
    });
  });
});