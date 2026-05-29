import { UploadedFileBulkCreateCommandHandler } from '@/application/commands/uploaded-file-create/uploaded-file-bulk-create.handler';
import { UploadedFileBulkCreateCommand } from '@/application/commands/uploaded-file-create/uploaded-file-bulk-create.command';
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

describe('UploadedFileBulkCreateCommandHandler', () => {
  let handler: UploadedFileBulkCreateCommandHandler;
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
    handler = new UploadedFileBulkCreateCommandHandler(mockRepository, mockStorageService, uploadService);
  });

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
      title: 'Campaign Attachments',
    };

    const command = new UploadedFileBulkCreateCommand(files, input);
    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(result[0].url).toBe('http://cloudinary.com/mock-file');
    expect(result[1].targetType).toBe(TargetType.CAMPAIGN);
    expect(mockStorageService.upload).toHaveBeenCalledTimes(2);
    expect(mockRepository.save).toHaveBeenCalledTimes(2);
  });

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
    };

    const command = new UploadedFileBulkCreateCommand(files, input);
    await expect(handler.execute(command)).rejects.toThrow('File size exceeds the 2MB limit');
  });
});
