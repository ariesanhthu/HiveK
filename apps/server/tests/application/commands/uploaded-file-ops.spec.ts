import { UploadedFileSoftDeleteCommandHandler } from '@/application/commands/uploaded-file-soft-delete/uploaded-file-soft-delete.handler';
import { UploadedFileSoftDeleteCommand } from '@/application/commands/uploaded-file-soft-delete/uploaded-file-soft-delete.command';
import { UploadedFileDeleteCommandHandler } from '@/application/commands/uploaded-file-delete/uploaded-file-delete.handler';
import { UploadedFileDeleteCommand } from '@/application/commands/uploaded-file-delete/uploaded-file-delete.command';
import { UploadedFileRestoreCommandHandler } from '@/application/commands/uploaded-file-restore/uploaded-file-restore.handler';
import { UploadedFileRestoreCommand } from '@/application/commands/uploaded-file-restore/uploaded-file-restore.command';
import { UploadedFileGetByIdHandler } from '@/application/queries/uploaded-file-get-by-id/uploaded-file-get-by-id.handler';
import { UploadedFileGetByIdQuery } from '@/application/queries/uploaded-file-get-by-id/uploaded-file-get-by-id.query';
import { UploadedFileGetListHandler } from '@/application/queries/uploaded-file-get-list/uploaded-file-get-list.handler';
import { UploadedFileGetListQuery } from '@/application/queries/uploaded-file-get-list/uploaded-file-get-list.query';
import { UploadedFileRoot } from '@/core/aggregate-roots';
import { ETargetType } from '@/core/enums/target-type.enum';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

import { UploadService } from '@/application/services';
import { IMAGE_PROCESSOR_SERVICE, type IImageProcessorService } from '@/application/interfaces';

describe('Uploaded File Operations', () => {
  let mockRepository: any;
  let mockStorageService: any;
  let mockReadService: any;
  let fileAggregate: UploadedFileRoot;
  let uploadService: UploadService;
  let mockImageProcessor: jest.Mocked<IImageProcessorService>;

  beforeEach(() => {
    fileAggregate = UploadedFileRoot.create({
      url: 'http://cloudinary.com/file',
      publicId: 'file-123',
      size: 1000,
      format: 'pdf',
      targetType: ETargetType.CAMPAIGN,
      targetId: 'camp-1',
      targetField: 'raw',
    });

    mockRepository = {
      findById: jest.fn().mockResolvedValue(fileAggregate),
      save: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    mockStorageService = {
      delete: jest.fn().mockResolvedValue(true),
    };

    mockReadService = {
      findById: jest.fn().mockResolvedValue({ id: 'file-123', format: 'pdf' }),
      findAll: jest.fn().mockResolvedValue(new PaginatedResponseDto([], null, false, 10)),
    };

    mockImageProcessor = { compress: jest.fn() };
    uploadService = new UploadService(mockImageProcessor);
  });

  describe('UploadedFileSoftDeleteCommandHandler', () => {
    it('should soft delete files', async () => {
      const handler = new UploadedFileSoftDeleteCommandHandler(mockRepository);
      await handler.execute(new UploadedFileSoftDeleteCommand('file-123', 'user-1'));
      expect(fileAggregate.deleteAt).toBeDefined();
      expect(fileAggregate.deleteBy).toBe('user-1');
      expect(mockRepository.save).toHaveBeenCalledWith(fileAggregate);
    });
  });

  describe('UploadedFileDeleteCommandHandler', () => {
    it('should hard delete files and invoke storage delete', async () => {
      const handler = new UploadedFileDeleteCommandHandler(mockRepository, mockStorageService, uploadService);
      await handler.execute(new UploadedFileDeleteCommand('file-123'));
      expect(mockStorageService.delete).toHaveBeenCalledWith('file-123', { resourceType: 'raw' });
      expect(mockRepository.delete).toHaveBeenCalledWith('file-123');
    });
  });

  describe('UploadedFileRestoreCommandHandler', () => {
    it('should restore soft deleted files', async () => {
      fileAggregate.softDelete('user-1');
      const handler = new UploadedFileRestoreCommandHandler(mockRepository);
      await handler.execute(new UploadedFileRestoreCommand('file-123'));
      expect(fileAggregate.deleteAt).toBeNull();
      expect(fileAggregate.deleteBy).toBeNull();
      expect(mockRepository.save).toHaveBeenCalledWith(fileAggregate);
    });
  });

  describe('UploadedFileGetByIdHandler', () => {
    it('should fetch file by id', async () => {
      const handler = new UploadedFileGetByIdHandler(mockReadService);
      const result = await handler.execute(new UploadedFileGetByIdQuery('file-123'));
      expect(result).toBeDefined();
      expect(result.id).toBe('file-123');
    });
  });

  describe('UploadedFileGetListHandler', () => {
    it('should query files list', async () => {
      const handler = new UploadedFileGetListHandler(mockReadService);
      const result = await handler.execute(new UploadedFileGetListQuery({}));
      expect(result).toBeDefined();
      expect(mockReadService.findAll).toHaveBeenCalled();
    });
  });
});
