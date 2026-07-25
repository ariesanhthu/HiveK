import { UploadedFileCreateCommandHandler } from '@/application/commands/uploaded-file-create/uploaded-file-create.handler';
import { UploadedFileCreateCommand } from '@/application/commands/uploaded-file-create/uploaded-file-create.command';
import { ETargetType } from '@/core/enums/target-type.enum';
import { UploadedFileCreatedEvent } from '@/core/events/uploaded-file-created.domain-event';
import { UploadedFileRoot } from '@/core/aggregate-roots';
import { createMockUploadedFileRepository } from '../../../__mocks__/mock-repositories';
import { createMockStorageService, createMockEventService, createMockUnitOfWork } from '../../../__mocks__/mock-services';
import { UploadService } from '@/application/services';
import { FileLinkerService } from '@/application/services';
import { IMAGE_PROCESSOR_SERVICE, type IImageProcessorService } from '@/application/interfaces';
import {
  USER_REPOSITORY,
} from '@/core/interfaces/repositories';

describe('UploadedFileCreateCommandHandler', () => {
  let handler: UploadedFileCreateCommandHandler;
  let mockRepository: ReturnType<typeof createMockUploadedFileRepository>;
  let mockStorageService: ReturnType<typeof createMockStorageService>;
  let mockEventService: ReturnType<typeof createMockEventService>;
  let mockUnitOfWork: ReturnType<typeof createMockUnitOfWork>;
  let uploadService: UploadService;
  let mockImageProcessor: jest.Mocked<IImageProcessorService>;
  let linker: FileLinkerService;
  let mockUserRepo: any;

  beforeEach(() => {
    mockRepository = createMockUploadedFileRepository();
    mockStorageService = createMockStorageService();
    mockEventService = createMockEventService();
    mockUnitOfWork = createMockUnitOfWork();
    mockImageProcessor = { compress: jest.fn() };
    uploadService = new UploadService(mockImageProcessor);

    mockUserRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    const mockCampaignRepo = {
      findById: jest.fn().mockResolvedValue({ rawContents: [], update: jest.fn() }),
      save: jest.fn(),
    };
    const mockScheduledPostRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    linker = new FileLinkerService(
      mockUserRepo,
      {} as any, // enterpriseRepo
      {} as any, // platformRepo
      mockCampaignRepo as any,
      mockScheduledPostRepo as any,
    );

    handler = new UploadedFileCreateCommandHandler(
      mockRepository,
      mockStorageService as any,
      mockUnitOfWork as any,
      mockEventService as any,
      uploadService,
      linker,
    );
  });

  describe('Happy Paths', () => {
    it('should upload a file successfully', async () => {
      const file = {
        buffer: Buffer.from('small buffer'),
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
      };
      const input = {
        targetType: ETargetType.CAMPAIGN,
        targetId: 'campaign-123',
        targetField: 'raw',
        title: 'Campaign Attachment',
      };

      mockStorageService.upload.mockResolvedValue({
        url: 'http://cloudinary.com/mock-file',
        publicId: 'mock-public-id',
        size: 500,
        format: 'pdf',
      });
      mockImageProcessor.compress.mockResolvedValue({ buffer: file.buffer, size: file.buffer.length });
      mockUnitOfWork.execute.mockImplementation(async (fn: any) => fn());

      const command = new UploadedFileCreateCommand(file, input);
      const result = await handler.execute(command);

      expect(result).toMatchObject({
        url: 'http://cloudinary.com/mock-file',
      });
      expect(result.targetField).toBe('raw');

      expect(mockStorageService.upload).toHaveBeenCalledWith(
        file.buffer,
        expect.objectContaining({
          folder: 'campaign',
        })
      );
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(UploadedFileRoot));
      expect(mockEventService.publishEvents).toHaveBeenCalledWith(expect.any(UploadedFileRoot));
    });

    it('should compress a large image file before uploading', async () => {
      const hugeBuffer = Buffer.alloc(3 * 1024 * 1024); // 3MB
      const compressedBuffer = Buffer.from('compressed-data');
      const file = {
        buffer: hugeBuffer,
        originalname: 'huge.jpg',
        mimetype: 'image/jpeg',
      };
      const input = {
        targetType: ETargetType.USER,
        targetId: 'user-123',
        targetField: 'avatar',
      };

      mockImageProcessor.compress.mockResolvedValue({ buffer: compressedBuffer, size: compressedBuffer.length });
      mockStorageService.upload.mockResolvedValue({
        url: 'http://cloudinary.com/mock-file',
        publicId: 'mock-public-id',
        size: compressedBuffer.length,
        format: 'jpg',
      });
      mockUnitOfWork.execute.mockImplementation(async (fn: any) => fn());

      const command = new UploadedFileCreateCommand(file, input);
      await handler.execute(command);

      expect(mockImageProcessor.compress).toHaveBeenCalledWith(hugeBuffer, 'image/jpeg');
      expect(mockStorageService.upload).toHaveBeenCalledWith(
        compressedBuffer,
        expect.any(Object)
      );
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('Sad Paths', () => {
    it('should throw error if imageProcessor fails', async () => {
      const hugeBuffer = Buffer.alloc(3 * 1024 * 1024); // 3MB
      const file = {
        buffer: hugeBuffer,
        originalname: 'huge.pdf',
        mimetype: 'application/pdf',
      };
      const input = {
        targetType: ETargetType.USER,
        targetId: 'user-123',
        targetField: 'document',
      };

      mockImageProcessor.compress.mockRejectedValue(new Error('File size exceeds the 2MB limit'));

      const command = new UploadedFileCreateCommand(file, input);
      await expect(handler.execute(command)).rejects.toThrow('File size exceeds the 2MB limit');
      expect(mockStorageService.upload).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
