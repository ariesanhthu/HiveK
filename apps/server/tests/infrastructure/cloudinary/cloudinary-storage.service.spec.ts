import { CloudinaryStorageService } from '@/infrastructure/cloudinary/cloudinary-storage.service';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

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

  describe('upload', () => {
    it('should upload a file', async () => {
      const mockResult = {
        secure_url: 'http://res.cloudinary.com/test.png',
        format: 'png',
        bytes: 100,
        public_id: 'test_id',
      };

      const mockStream = {
        end: jest.fn(),
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((options, callback) => {
        callback(null, mockResult);
        return mockStream;
      });

      const buffer = Buffer.from('test');
      const result = await service.upload(buffer);

      expect(result.url).toBe(mockResult.secure_url);
      expect(mockStream.end).toHaveBeenCalledWith(buffer);
    });

    it('should reject if upload fails', async () => {
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((options, callback) => {
        callback(new Error('Upload failed'), null);
        return { end: jest.fn() };
      });

      await expect(service.upload(Buffer.from('test'))).rejects.toThrow('Upload failed');
    });
  });

  describe('delete', () => {
    it('should delete a resource', async () => {
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({ result: 'ok' });

      const result = await service.delete('public_id');
      expect(result).toBe(true);
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('public_id', expect.anything());
    });

    it('should return false if deletion fails', async () => {
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({ result: 'failed' });
      const result = await service.delete('public_id');
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(new Error('API Error'));
      const result = await service.delete('public_id');
      expect(result).toBe(false);
    });
  });

  describe('bulkDelete', () => {
    it('should bulk delete resources', async () => {
      (cloudinary.api.delete_resources as jest.Mock).mockResolvedValue({
        deleted: { id1: 'deleted', id2: 'not_found' },
      });

      const result = await service.bulkDelete(['id1', 'id2']);
      expect(result.success).toEqual(['id1', 'id2']);
      expect(result.failed).toEqual([]);
    });

    it('should fallback to individual deletes if API fails', async () => {
      (cloudinary.api.delete_resources as jest.Mock).mockRejectedValue(new Error('API failure'));
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({ result: 'ok' });

      const result = await service.bulkDelete(['id1']);
      expect(result.success).toEqual(['id1']);
      expect(cloudinary.uploader.destroy).toHaveBeenCalled();
    });
  });

  describe('extractPublicIdFromUrl', () => {
    it('should extract public_id from standard Cloudinary URL', () => {
      const url =
        'https://res.cloudinary.com/test-cloud/image/upload/v123456/hivek-uploads/abc123.jpg';
      const result = service.extractPublicIdFromUrl(url);
      expect(result).toBe('hivek-uploads/abc123');
    });

    it('should return null for non-Cloudinary URL', () => {
      const url = 'https://example.com/image.jpg';
      const result = service.extractPublicIdFromUrl(url);
      expect(result).toBeNull();
    });
  });
});
