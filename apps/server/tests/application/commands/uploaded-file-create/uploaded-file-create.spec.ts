import { UploadedFileCreateCommand } from '@/application/commands/uploaded-file-create/uploaded-file-create.command';
import { UploadedFileCreateCommandHandler } from '@/application/commands/uploaded-file-create/uploaded-file-create.handler';
import { UploadedFileCreatedEvent } from '@/application/events';
import { UploadService } from '@/application/services';
import { UploadedFileRoot } from '@/core/aggregate-roots';
import { TargetType } from '@/core/enums/target-type.enum';
import { createMockUploadedFileRepository } from '../../../__mocks__/mock-repositories';
import { createMockEventBus, createMockStorageService } from '../../../__mocks__/mock-services';

jest.mock('sharp', () => {
  const sharpMock = jest.fn(() => ({
    metadata: jest.fn().mockResolvedValue({ width: 2500, format: 'jpeg' }),
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-compressed-data')),
  }));
  return sharpMock;
});

describe('UploadedFileCreateCommandHandler', () => {
  let handler: UploadedFileCreateCommandHandler;
  let mockRepository: ReturnType<typeof createMockUploadedFileRepository>;
  let mockStorageService: ReturnType<typeof createMockStorageService>;
  let mockEventBus: ReturnType<typeof createMockEventBus>;
  let uploadService: UploadService;

  beforeEach(() => {
    mockRepository = createMockUploadedFileRepository();
    mockStorageService = createMockStorageService();
    mockEventBus = createMockEventBus();
    uploadService = new UploadService();

    handler = new UploadedFileCreateCommandHandler(
      mockRepository,
      mockStorageService as any,
      uploadService,
      mockEventBus as any,
    );
  });

  describe('Happy Paths', () => {
    it('should upload a normal file successfully', async () => {
      const file = {
        buffer: Buffer.from('small buffer'),
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
      };
      const input = {
        targetType: TargetType.CAMPAIGN,
        targetId: 'campaign-123',
        targetField: 'contract_file',
        title: 'Campaign Attachment',
      };

      mockStorageService.upload.mockResolvedValue({
        url: 'http://cloudinary.com/mock-file',
        publicId: 'mock-public-id',
        size: 500,
        format: 'pdf',
      });

      const command = new UploadedFileCreateCommand(file, input);
      const result = await handler.execute(command);

      expect(result).toBeDefined();
      expect(result.url).toBe('http://cloudinary.com/mock-file');
      expect(result.targetField).toBe('contractFile'); // normalized to camelCase

      expect(mockStorageService.upload).toHaveBeenCalledWith(
        file.buffer,
        expect.objectContaining({
          folder: 'campaign',
        }),
      );
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(UploadedFileRoot));
      expect(mockEventBus.publish).toHaveBeenCalledWith(expect.any(UploadedFileCreatedEvent));
    });

    it('should compress a large image file before uploading', async () => {
      const hugeBuffer = Buffer.alloc(3 * 1024 * 1024); // 3MB
      const file = {
        buffer: hugeBuffer,
        originalname: 'huge.jpg',
        mimetype: 'image/jpeg',
      };
      const input = {
        targetType: TargetType.USER,
        targetId: 'user-123',
        targetField: 'avatar_url',
      };

      const command = new UploadedFileCreateCommand(file, input);
      await handler.execute(command);

      // Verify that upload was called with the mock-compressed-data from sharp mock
      expect(mockStorageService.upload).toHaveBeenCalledWith(
        Buffer.from('mock-compressed-data'),
        expect.any(Object),
      );
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('Sad Paths', () => {
    it('should throw BadRequestException if non-image file exceeds 2MB', async () => {
      const hugeBuffer = Buffer.alloc(3 * 1024 * 1024); // 3MB
      const file = {
        buffer: hugeBuffer,
        originalname: 'huge.pdf',
        mimetype: 'application/pdf',
      };
      const input = {
        targetType: TargetType.USER,
        targetId: 'user-123',
        targetField: 'document',
      };

      const command = new UploadedFileCreateCommand(file, input);
      await expect(handler.execute(command)).rejects.toThrow('File size exceeds the 2MB limit');
      expect(mockStorageService.upload).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
