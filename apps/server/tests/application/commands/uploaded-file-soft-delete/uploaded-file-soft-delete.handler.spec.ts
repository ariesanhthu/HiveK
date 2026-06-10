import { UploadedFileSoftDeleteCommandHandler } from '@/application/commands/uploaded-file-soft-delete/uploaded-file-soft-delete.handler';
import { UploadedFileSoftDeleteCommand } from '@/application/commands/uploaded-file-soft-delete/uploaded-file-soft-delete.command';
import { UploadedFileNotFoundException } from '@/core/exceptions';

describe('UploadedFileSoftDeleteCommandHandler', () => {
  let handler: UploadedFileSoftDeleteCommandHandler;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new UploadedFileSoftDeleteCommandHandler(mockRepository);
  });

  it('should soft delete a file', async () => {
    const file = { id: 'file-1', softDelete: jest.fn() };
    mockRepository.findById.mockResolvedValue(file);

    await handler.execute(new UploadedFileSoftDeleteCommand('file-1', 'user-1'));

    expect(file.softDelete).toHaveBeenCalledWith('user-1');
    expect(mockRepository.save).toHaveBeenCalledWith(file);
  });

  it('should use default deletor as "system"', async () => {
    const file = { id: 'file-1', softDelete: jest.fn() };
    mockRepository.findById.mockResolvedValue(file);

    await handler.execute(new UploadedFileSoftDeleteCommand('file-1'));

    expect(file.softDelete).toHaveBeenCalledWith('system');
  });

  it('should throw UploadedFileNotFoundException when file not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(handler.execute(new UploadedFileSoftDeleteCommand('nonexistent'))).rejects.toThrow(UploadedFileNotFoundException);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});