import { UploadedFileSoftDeleteCommandHandler } from '@/application/commands/uploaded-file-soft-delete/uploaded-file-soft-delete.handler';
import { UploadedFileSoftDeleteCommand } from '@/application/commands/uploaded-file-soft-delete/uploaded-file-soft-delete.command';
import { UploadedFileNotFoundException } from '@/core/exceptions';
import { UploadedFileRoot } from '@/core/aggregate-roots';
import { ETargetType } from '@/core/enums';
import { createMockUploadedFileRepository } from '../../../__mocks__/mock-repositories';

describe('UploadedFileSoftDeleteCommandHandler', () => {
  let handler: UploadedFileSoftDeleteCommandHandler;
  let mockRepository: ReturnType<typeof createMockUploadedFileRepository>;

  beforeEach(() => {
    mockRepository = createMockUploadedFileRepository();
    handler = new UploadedFileSoftDeleteCommandHandler(mockRepository);
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
    deleteAt: null,
    deleteBy: null,
  });

  describe('Happy Path', () => {
    it('should soft delete a file', async () => {
      const file = createMockFile();
      mockRepository.findById.mockResolvedValue(file);

      await handler.execute(new UploadedFileSoftDeleteCommand(fileId, 'user-1'));

      expect(file.deleteAt).toBeDefined();
      expect(file.deleteBy).toBe('user-1');
      expect(mockRepository.save).toHaveBeenCalledWith(file);
    });

    it('should use default deletor as "system" if not provided', async () => {
      const file = createMockFile();
      mockRepository.findById.mockResolvedValue(file);

      await handler.execute(new UploadedFileSoftDeleteCommand(fileId));

      expect(file.deleteBy).toBe('system');
    });
  });

  describe('Sad Path', () => {
    it('should throw UploadedFileNotFoundException when file not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(handler.execute(new UploadedFileSoftDeleteCommand('nonexistent'))).rejects.toThrow(UploadedFileNotFoundException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
