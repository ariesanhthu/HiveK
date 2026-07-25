import { UploadedFileBulkCreateCommandHandler } from '@/application/commands/uploaded-file-bulk-create/uploaded-file-bulk-create.handler';
import { UploadedFileBulkCreateCommand } from '@/application/commands/uploaded-file-bulk-create/uploaded-file-bulk-create.command';
import { UploadedFileCreateCommand } from '@/application/commands/uploaded-file-create/uploaded-file-create.command';
import { ETargetType } from '@/core/enums/target-type.enum';
import { UploadedFileDto } from '@/application/dtos';
import { createMockCommandBus } from '../../../__mocks__/mock-services';
import { BadRequestException } from '@nestjs/common';

describe('UploadedFileBulkCreateCommandHandler', () => {
  let handler: UploadedFileBulkCreateCommandHandler;
  let mockCommandBus: ReturnType<typeof createMockCommandBus>;

  beforeEach(() => {
    mockCommandBus = createMockCommandBus() as any;
    handler = new UploadedFileBulkCreateCommandHandler(mockCommandBus as any);
  });

  describe('Happy Paths', () => {
    it('should upload multiple files successfully via command bus delegation', async () => {
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
        targetType: ETargetType.CAMPAIGN as any,
        targetId: 'campaign-123',
        targetField: 'raw' as any,
        title: 'Campaign Attachments',
      };

      const dto1 = { id: 'file-1', url: 'http://cloudinary.com/1', format: 'pdf', size: 500 } as UploadedFileDto;
      const dto2 = { id: 'file-2', url: 'http://cloudinary.com/2', format: 'png', size: 300 } as UploadedFileDto;
      mockCommandBus.execute
        .mockResolvedValueOnce(dto1)
        .mockResolvedValueOnce(dto2);

      const command = new UploadedFileBulkCreateCommand(files, input);
      const result = await handler.execute(command);

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('file-1');
      expect(result[1].id).toBe('file-2');
      expect(mockCommandBus.execute).toHaveBeenCalledTimes(2);
      expect(mockCommandBus.execute).toHaveBeenCalledWith(expect.any(UploadedFileCreateCommand));
    });
  });

  describe('Sad Paths', () => {
    it('should throw BadRequestException if more than 10 files', async () => {
      const files = Array.from({ length: 11 }, (_, i) => ({
        buffer: Buffer.from(`file ${i}`),
        originalname: `test${i}.pdf`,
        mimetype: 'application/pdf',
      }));
      const input = {
        targetType: ETargetType.USER as any,
        targetId: 'user-123',
        targetField: 'avatar' as any,
      };

      const command = new UploadedFileBulkCreateCommand(files, input);
      await expect(handler.execute(command)).rejects.toThrow(
        new BadRequestException('Cannot upload more than 10 files at a time')
      );
      expect(mockCommandBus.execute).not.toHaveBeenCalled();
    });

    it('should throw error if any individual upload fails', async () => {
      const files = [
        {
          buffer: Buffer.from('file 1'),
          originalname: 'test1.pdf',
          mimetype: 'application/pdf',
        },
        {
          buffer: Buffer.from('file 2'),
          originalname: 'test2.pdf',
          mimetype: 'application/pdf',
        },
      ];
      const input = {
        targetType: ETargetType.USER as any,
        targetId: 'user-123',
        targetField: 'avatar' as any,
      };

      mockCommandBus.execute
        .mockResolvedValueOnce({ id: 'file-1' } as UploadedFileDto)
        .mockRejectedValueOnce(new Error('Upload failed'));

      const command = new UploadedFileBulkCreateCommand(files, input);
      await expect(handler.execute(command)).rejects.toThrow('Upload failed');
    });
  });
});
