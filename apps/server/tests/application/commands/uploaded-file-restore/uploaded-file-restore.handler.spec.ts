import { UploadedFileRestoreCommandHandler } from '@/application/commands/uploaded-file-restore/uploaded-file-restore.handler';
import { UploadedFileRestoreCommand } from '@/application/commands/uploaded-file-restore/uploaded-file-restore.command';
import { UploadedFileNotFoundException } from '@/core/exceptions';

describe('UploadedFileRestoreCommandHandler', () => {
  let handler: UploadedFileRestoreCommandHandler;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new UploadedFileRestoreCommandHandler(mockRepository);
  });

  it('should restore a soft-deleted file', async () => {
    const file = { id: 'file-1', restore: jest.fn() };
    mockRepository.findById.mockResolvedValue(file);

    await handler.execute(new UploadedFileRestoreCommand('file-1'));

    expect(file.restore).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalledWith(file);
  });

  it('should throw UploadedFileNotFoundException when file not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(handler.execute(new UploadedFileRestoreCommand('nonexistent'))).rejects.toThrow(UploadedFileNotFoundException);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});