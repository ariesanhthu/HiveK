import { UploadedFileGetByIdHandler } from '@/application/queries/uploaded-file-get-by-id/uploaded-file-get-by-id.handler';
import { UploadedFileGetByIdQuery } from '@/application/queries/uploaded-file-get-by-id/uploaded-file-get-by-id.query';
import { UploadedFileNotFoundException } from '@/core/exceptions';

describe('UploadedFileGetByIdHandler', () => {
  let handler: UploadedFileGetByIdHandler;
  let mockReadService: any;

  beforeEach(() => {
    mockReadService = {
      findById: jest.fn(),
    };
    handler = new UploadedFileGetByIdHandler(mockReadService);
  });

  it('should return file when found', async () => {
    const fileDto = { id: 'file-1', url: 'https://example.com/file.jpg' };
    mockReadService.findById.mockResolvedValue(fileDto);

    const result = await handler.execute(new UploadedFileGetByIdQuery('file-1'));

    expect(result).toEqual(fileDto);
    expect(mockReadService.findById).toHaveBeenCalledWith('file-1');
  });

  it('should throw UploadedFileNotFoundException when not found', async () => {
    mockReadService.findById.mockResolvedValue(null);

    await expect(handler.execute(new UploadedFileGetByIdQuery('nonexistent'))).rejects.toThrow(UploadedFileNotFoundException);
  });
});