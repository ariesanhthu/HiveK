import { UploadedFileRestoreCommandHandler } from '@/application/commands/uploaded-file-restore/uploaded-file-restore.handler';
import { UploadedFileRestoreCommand } from '@/application/commands/uploaded-file-restore/uploaded-file-restore.command';
import { UploadedFileNotFoundException } from '@/core/exceptions';
import { UploadedFileRoot } from '@/core/aggregate-roots';
import { ETargetType } from '@/core/enums';
import { createMockUploadedFileRepository } from '../../../__mocks__/mock-repositories';

describe('UploadedFileRestoreCommandHandler', () => {
  let handler: UploadedFileRestoreCommandHandler;
  let mockRepository: ReturnType<typeof createMockUploadedFileRepository>;

  beforeEach(() => {
    mockRepository = createMockUploadedFileRepository();
    handler = new UploadedFileRestoreCommandHandler(mockRepository);
  });

  const fileId = 'file-123';
  const createMockFile = () => UploadedFileRoot.instantiate(fileId, {
    url: 'http://test.com/file.jpg',
    publicId: 'pub-123',
    size: 1000,
    format: 'jpg',
    title: 'Test File',
    targetType: ETargetType.USER,
    targetId: 'user-1',
    targetField: 'avatar',
    createdAt: new Date(),
    updatedAt: new Date(),
    deleteAt: new Date(),
    deleteBy: 'user-1',
  });

  describe('Happy Path', () => {
    it('should restore a soft-deleted file', async () => {
      const file = createMockFile();
      mockRepository.findById.mockResolvedValue(file);

      await handler.execute(new UploadedFileRestoreCommand(fileId));

      expect(file.deleteAt).toBeNull();
      expect(file.deleteBy).toBeNull();
      expect(mockRepository.save).toHaveBeenCalledWith(file);
    });
  });

  describe('Sad Path', () => {
    it('should throw UploadedFileNotFoundException when file not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(handler.execute(new UploadedFileRestoreCommand('nonexistent'))).rejects.toThrow(UploadedFileNotFoundException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
