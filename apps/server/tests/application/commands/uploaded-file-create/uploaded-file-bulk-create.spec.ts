import { UploadedFileBulkCreateCommand } from '@/application/commands/uploaded-file-create/uploaded-file-bulk-create.command';
import { UploadedFileBulkCreateCommandHandler } from '@/application/commands/uploaded-file-create/uploaded-file-bulk-create.handler';
import { UploadedFileCreatedEvent } from '@/application/events';
import { UploadService } from '@/application/services';
import { UploadedFileRoot } from '@/core/aggregate-roots';
import { TargetType } from '@/core/enums/target-type.enum';
import { createMockUploadedFileRepository } from '../../../__mocks__/mock-repositories';
import { createMockEventBus, createMockStorageService } from '../../../__mocks__/mock-services';

jest.mock('sharp', () => {
  const sharpMock = jest.fn(() => ({
    metadata: jest.fn().mockResolvedValue({ width: 1000, format: 'png' }),
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-processed-data')),
  }));
  return sharpMock;
});

describe('UploadedFileBulkCreateCommandHandler', () => {
  let handler: UploadedFileBulkCreateCommandHandler;
  let mockRepository: ReturnType<typeof createMockUploadedFileRepository>;
  let mockStorageService: ReturnType<typeof createMockStorageService>;
  let mockEventBus: ReturnType<typeof createMockEventBus>;
  let uploadService: UploadService;

  beforeEach(() => {
    mockRepository = createMockUploadedFileRepository();
    mockStorageService = createMockStorageService();
    mockEventBus = createMockEventBus();
    uploadService = new UploadService();

    handler = new UploadedFileBulkCreateCommandHandler(
      mockRepository,
      mockStorageService as any,
      uploadService,
      mockEventBus as any,
    );
  });

  describe('Happy Paths', () => {
    it('should upload multiple files successfully', async () => {
      const files = [
        {
          buffer: Buffer.from('file 1'),
          originalname: 'test1.pdf',
          mimetype: 'application/pdf',
        },
        {
          buffer: Buffer.from('file 2'),
          originalname: 'test2.png',
          mimetype: 'image/png',
        },
      ];
      const input = {
        targetType: TargetType.CAMPAIGN,
        targetId: 'campaign-123',
        targetField: 'attachments',
        title: 'Campaign Attachments',
      };

      mockStorageService.upload.mockResolvedValue({
        url: 'http://cloudinary.com/mock-file',
        publicId: 'mock-public-id',
        size: 500,
        format: 'pdf',
      });

      const command = new UploadedFileBulkCreateCommand(files, input);
      const result = await handler.execute(command);

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(mockStorageService.upload).toHaveBeenCalledTimes(2);
      expect(mockRepository.save).toHaveBeenCalledTimes(2);
      expect(mockEventBus.publish).toHaveBeenCalledTimes(2);
      expect(mockEventBus.publish).toHaveBeenCalledWith(expect.any(UploadedFileCreatedEvent));
    });
  });

  describe('Sad Paths', () => {
    it('should throw error if any non-image file in the batch exceeds 2MB', async () => {
      const hugeBuffer = Buffer.alloc(3 * 1024 * 1024); // 3MB
      const files = [
        {
          buffer: Buffer.from('small buffer'),
          originalname: 'small.pdf',
          mimetype: 'application/pdf',
        },
        {
          buffer: hugeBuffer,
          originalname: 'huge.pdf',
          mimetype: 'application/pdf',
        },
      ];
      const input = {
        targetType: TargetType.USER,
        targetId: 'user-123',
        targetField: 'document',
      };

      const command = new UploadedFileBulkCreateCommand(files, input);
      await expect(handler.execute(command)).rejects.toThrow('File size exceeds the 2MB limit');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
