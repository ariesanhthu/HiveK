import { UploadedFileDeleteCommandHandler } from '@/application/commands/uploaded-file-delete/uploaded-file-delete.handler';
import { UploadedFileDeleteCommand } from '@/application/commands/uploaded-file-delete/uploaded-file-delete.command';
import { UploadedFileNotFoundException } from '@/core/exceptions';

describe('UploadedFileDeleteCommandHandler', () => {
  let handler: UploadedFileDeleteCommandHandler;
  let mockRepository: any;
  let mockStorageService: any;
  let mockUploadService: any;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };
    mockStorageService = {
      delete: jest.fn().mockResolvedValue(undefined),
    };
    mockUploadService = {
      getResourceType: jest.fn().mockReturnValue('image'),
    };
    handler = new UploadedFileDeleteCommandHandler(mockRepository, mockStorageService, mockUploadService);
  });

  it('should delete a file from storage and DB', async () => {
    const file = { id: 'file-1', publicId: 'pub-123', format: 'jpg' };
    mockRepository.findById.mockResolvedValue(file);

    await handler.execute(new UploadedFileDeleteCommand('file-1'));

    expect(mockUploadService.getResourceType).toHaveBeenCalledWith('jpg');
    expect(mockStorageService.delete).toHaveBeenCalledWith('pub-123', { resourceType: 'image' });
    expect(mockRepository.delete).toHaveBeenCalledWith('file-1');
  });

  it('should skip storage deletion if publicId is empty', async () => {
    const file = { id: 'file-2', publicId: '', format: 'png' };
    mockRepository.findById.mockResolvedValue(file);

    await handler.execute(new UploadedFileDeleteCommand('file-2'));

    expect(mockStorageService.delete).not.toHaveBeenCalled();
    expect(mockRepository.delete).toHaveBeenCalledWith('file-2');
  });

  it('should throw UploadedFileNotFoundException when file not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(handler.execute(new UploadedFileDeleteCommand('nonexistent'))).rejects.toThrow(UploadedFileNotFoundException);
    expect(mockRepository.delete).not.toHaveBeenCalled();
    expect(mockStorageService.delete).not.toHaveBeenCalled();
  });

  it('should propagate storage deletion failure', async () => {
    const file = { id: 'file-3', publicId: 'pub-456', format: 'jpg' };
    mockRepository.findById.mockResolvedValue(file);
    mockStorageService.delete.mockRejectedValue(new Error('Storage unreachable'));

    await expect(handler.execute(new UploadedFileDeleteCommand('file-3'))).rejects.toThrow('Storage unreachable');
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });
});