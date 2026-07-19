import { UploadService } from '@/application/services/upload.service';
import { IMAGE_PROCESSOR_SERVICE, type IImageProcessorService } from '@/application/interfaces';

describe('UploadService', () => {
  let service: UploadService;
  let mockImageProcessor: jest.Mocked<IImageProcessorService>;

  beforeEach(() => {
    mockImageProcessor = {
      compress: jest.fn(),
    };
    service = new UploadService(mockImageProcessor);
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
    it('should delegate to imageProcessor.compress', async () => {
      const buffer = Buffer.from('test-data');
      const mimetype = 'image/jpeg';
      const expected = { buffer: Buffer.from('compressed'), size: 9 };
      mockImageProcessor.compress.mockResolvedValue(expected);

      const result = await service.processAndValidateFile(buffer, mimetype, 'test.jpg');

      expect(mockImageProcessor.compress).toHaveBeenCalledWith(buffer, mimetype);
      expect(result).toEqual(expected);
    });

    it('should propagate errors from imageProcessor', async () => {
      const buffer = Buffer.alloc(3 * 1024 * 1024);
      mockImageProcessor.compress.mockRejectedValue(new Error('Compression failed'));

      await expect(
        service.processAndValidateFile(buffer, 'application/pdf', 'test.pdf')
      ).rejects.toThrow('Compression failed');
    });
  });
});
