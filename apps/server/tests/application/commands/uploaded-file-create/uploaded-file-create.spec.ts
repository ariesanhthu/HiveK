import { UploadedFileCreateCommandHandler } from '@/application/commands/uploaded-file-create/uploaded-file-create.handler';
import { UploadedFileCreateCommand } from '@/application/commands/uploaded-file-create/uploaded-file-create.command';
import { TargetType } from '@/core/enums/target-type.enum';

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

import { UploadService } from '@/application/services';

describe('UploadedFileCreateCommandHandler', () => {
  let handler: UploadedFileCreateCommandHandler;
  let mockRepository: any;
  let mockStorageService: any;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn().mockImplementation((root) => {
        root.setId('mock-file-id');
        return Promise.resolve();
      }),
    };
    mockStorageService = {
      upload: jest.fn().mockResolvedValue({
        url: 'http://cloudinary.com/mock-file',
        publicId: 'mock-public-id',
        size: 500,
        format: 'jpg',
      }),
    };
    const uploadService = new UploadService();
    handler = new UploadedFileCreateCommandHandler(mockRepository, mockStorageService, uploadService);
  });

  it('should upload a normal file successfully', async () => {
    const file = {
      buffer: Buffer.from('small buffer'),
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
    };
    const input = {
      targetType: TargetType.CAMPAIGN,
      targetId: 'campaign-123',
      title: 'Campaign Attachment',
    };

    const command = new UploadedFileCreateCommand(file, input);
    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.url).toBe('http://cloudinary.com/mock-file');
    expect(result.targetType).toBe(TargetType.CAMPAIGN);
    expect(mockStorageService.upload).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('should compress a large image file', async () => {
    const hugeBuffer = Buffer.alloc(3 * 1024 * 1024); // 3MB
    const file = {
      buffer: hugeBuffer,
      originalname: 'huge.jpg',
      mimetype: 'image/jpeg',
    };
    const input = {
      targetType: TargetType.USER,
      targetId: 'user-123',
    };

    const command = new UploadedFileCreateCommand(file, input);
    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(mockStorageService.upload).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('should throw error if non-image file exceeds 2MB', async () => {
    const hugeBuffer = Buffer.alloc(3 * 1024 * 1024); // 3MB
    const file = {
      buffer: hugeBuffer,
      originalname: 'huge.pdf',
      mimetype: 'application/pdf',
    };
    const input = {
      targetType: TargetType.USER,
      targetId: 'user-123',
    };

    const command = new UploadedFileCreateCommand(file, input);
    await expect(handler.execute(command)).rejects.toThrow('File size exceeds the 2MB limit');
  });
});
