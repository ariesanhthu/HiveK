import { UploadService } from '@/application/services/upload.service';
import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';

// Mock the sharp library
jest.mock('sharp');

describe('UploadService', () => {
  let service: UploadService;
  let mockSharpInstance: any;

  beforeEach(() => {
    service = new UploadService();
    mockSharpInstance = {
      metadata: jest.fn(),
      resize: jest.fn().mockReturnThis(),
      jpeg: jest.fn().mockReturnThis(),
      png: jest.fn().mockReturnThis(),
      webp: jest.fn().mockReturnThis(),
      toBuffer: jest.fn(),
    };
    (sharp as unknown as jest.Mock).mockReturnValue(mockSharpInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getResourceType', () => {
    it('should return image for image mimetypes and formats', () => {
      expect(service.getResourceType('image/png')).toBe('image');
      expect(service.getResourceType('jpeg')).toBe('image');
      expect(service.getResourceType('image/webp')).toBe('image');
    });

    it('should return video for video mimetypes and formats', () => {
      expect(service.getResourceType('video/mp4')).toBe('video');
      expect(service.getResourceType('mov')).toBe('video');
    });

    it('should return raw for other mimetypes and formats', () => {
      expect(service.getResourceType('application/pdf')).toBe('raw');
      expect(service.getResourceType('zip')).toBe('raw');
    });
  });

  describe('processAndValidateFile', () => {
    it('should return the original buffer and size if size is below limit', async () => {
      const buffer = Buffer.from('hello');
      const result = await service.processAndValidateFile(buffer, 'text/plain', 'test.txt');

      expect(result).toEqual({ buffer, size: 5 });
    });

    it('should throw BadRequestException if non-image file exceeds 2MB limit', async () => {
      const largeBuffer = Buffer.alloc(2.1 * 1024 * 1024); // 2.1 MB
      await expect(
        service.processAndValidateFile(largeBuffer, 'application/pdf', 'test.pdf')
      ).rejects.toThrow(new BadRequestException('File size exceeds the 2MB limit'));
    });

    it('should compress and resize a large image successfully', async () => {
      const largeBuffer = Buffer.alloc(2.5 * 1024 * 1024); // 2.5 MB
      const compressedBuffer = Buffer.alloc(1.5 * 1024 * 1024); // 1.5 MB

      mockSharpInstance.metadata.mockResolvedValue({ width: 2500, format: 'jpeg' });
      mockSharpInstance.toBuffer.mockResolvedValue(compressedBuffer);

      const result = await service.processAndValidateFile(largeBuffer, 'image/jpeg', 'test.jpg');

      expect(sharp).toHaveBeenCalledWith(largeBuffer);
      expect(mockSharpInstance.resize).toHaveBeenCalledWith({ width: 1920 });
      expect(mockSharpInstance.jpeg).toHaveBeenCalledWith({ quality: 75 });
      expect(result).toEqual({ buffer: compressedBuffer, size: compressedBuffer.length });
    });

    it('should try harder to compress if first attempt is still above 2MB', async () => {
      const largeBuffer = Buffer.alloc(3 * 1024 * 1024); // 3 MB
      const attempt1Buffer = Buffer.alloc(2.2 * 1024 * 1024); // 2.2 MB (still > 2MB)
      const attempt2Buffer = Buffer.alloc(1.8 * 1024 * 1024); // 1.8 MB (now < 2MB)

      mockSharpInstance.metadata.mockResolvedValue({ width: 2500, format: 'png' });
      // First call to toBuffer resolves to attempt1Buffer, second call to attempt2Buffer
      mockSharpInstance.toBuffer
        .mockResolvedValueOnce(attempt1Buffer)
        .mockResolvedValueOnce(attempt2Buffer);

      const result = await service.processAndValidateFile(largeBuffer, 'image/png', 'test.png');

      expect(sharp).toHaveBeenNthCalledWith(1, largeBuffer);
      expect(mockSharpInstance.png).toHaveBeenCalledWith({ quality: 75, compressionLevel: 8 });
      expect(sharp).toHaveBeenNthCalledWith(2, attempt1Buffer);
      expect(mockSharpInstance.resize).toHaveBeenLastCalledWith({ width: 1920 });
      expect(mockSharpInstance.jpeg).toHaveBeenCalledWith({ quality: 50 });
      expect(result).toEqual({ buffer: attempt2Buffer, size: attempt2Buffer.length });
    });

    it('should throw BadRequestException if image is still above 2MB after all attempts', async () => {
      const largeBuffer = Buffer.alloc(3 * 1024 * 1024); // 3 MB
      const attempt1Buffer = Buffer.alloc(2.2 * 1024 * 1024); // 2.2 MB
      const attempt2Buffer = Buffer.alloc(2.1 * 1024 * 1024); // 2.1 MB (still > 2MB)

      mockSharpInstance.metadata.mockResolvedValue({ width: 2000, format: 'webp' });
      mockSharpInstance.toBuffer
        .mockResolvedValueOnce(attempt1Buffer)
        .mockResolvedValueOnce(attempt2Buffer);

      await expect(
        service.processAndValidateFile(largeBuffer, 'image/webp', 'test.webp')
      ).rejects.toThrow(new BadRequestException('Image could not be compressed under the 2MB limit'));
    });

    it('should throw BadRequestException on compression error', async () => {
      const largeBuffer = Buffer.alloc(3 * 1024 * 1024); // 3 MB
      mockSharpInstance.metadata.mockRejectedValue(new Error('Sharp processing failed'));

      await expect(
        service.processAndValidateFile(largeBuffer, 'image/jpeg', 'test.jpg')
      ).rejects.toThrow(new BadRequestException('Failed to compress image: Sharp processing failed'));
    });
  });
});
