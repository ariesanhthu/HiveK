import { UploadedFileDeleteCommand } from '@/application/commands/uploaded-file-delete/uploaded-file-delete.command';
import { UploadedFileDeleteCommandHandler } from '@/application/commands/uploaded-file-delete/uploaded-file-delete.handler';
import { UploadService } from '@/application/services';
import { UploadedFileRoot } from '@/core/aggregate-roots';
import { TargetType } from '@/core/enums';
import { UploadedFileNotFoundException } from '@/core/exceptions';
import { createMockUploadedFileRepository } from '../../../__mocks__/mock-repositories';
import { createMockAuthService, createMockStorageService } from '../../../__mocks__/mock-services';

describe('UploadedFileDeleteCommandHandler', () => {
  let handler: UploadedFileDeleteCommandHandler;
  let mockRepository: ReturnType<typeof createMockUploadedFileRepository>;
  let mockStorageService: ReturnType<typeof createMockStorageService>;
  let uploadService: UploadService;

  beforeEach(() => {
    mockRepository = createMockUploadedFileRepository();
    mockStorageService = createMockStorageService();
    uploadService = new UploadService();

    handler = new UploadedFileDeleteCommandHandler(
      mockRepository,
      mockStorageService as any,
      uploadService,
    );
  });

  const fileId = 'file-123';
  const createMockFile = () =>
    UploadedFileRoot.instantiate(fileId, {
      url: 'http://test.com/file.jpg',
      publicId: 'pub-123',
      size: 1000,
      format: 'jpg',
      title: 'Test File',
      targetType: TargetType.USER,
      targetId: 'user-1',
      targetField: 'avatar',
      createdAt: new Date(),
      updatedAt: new Date(),
      deleteAt: null,
      deleteBy: null,
    });

  describe('Happy Paths', () => {
    it('should delete a file from storage and DB', async () => {
      const file = createMockFile();
      mockRepository.findById.mockResolvedValue(file);

      await handler.execute(new UploadedFileDeleteCommand(fileId));

      expect(mockStorageService.delete).toHaveBeenCalledWith('pub-123', { resourceType: 'image' });
      expect(mockRepository.delete).toHaveBeenCalledWith(fileId);
    });

    it('should skip storage deletion if publicId is missing', async () => {
      const file = UploadedFileRoot.instantiate(fileId, {
        ...createMockFile().props,
        publicId: '',
      });
      mockRepository.findById.mockResolvedValue(file);

      await handler.execute(new UploadedFileDeleteCommand(fileId));

      expect(mockStorageService.delete).not.toHaveBeenCalled();
      expect(mockRepository.delete).toHaveBeenCalledWith(fileId);
    });
  });

  describe('Sad Paths', () => {
    it('should throw UploadedFileNotFoundException when file not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(handler.execute(new UploadedFileDeleteCommand('nonexistent'))).rejects.toThrow(
        UploadedFileNotFoundException,
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
      expect(mockStorageService.delete).not.toHaveBeenCalled();
    });

    it('should propagate storage deletion failure', async () => {
      const file = createMockFile();
      mockRepository.findById.mockResolvedValue(file);
      mockStorageService.delete.mockRejectedValue(new Error('Storage unreachable'));

      await expect(handler.execute(new UploadedFileDeleteCommand(fileId))).rejects.toThrow(
        'Storage unreachable',
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});
