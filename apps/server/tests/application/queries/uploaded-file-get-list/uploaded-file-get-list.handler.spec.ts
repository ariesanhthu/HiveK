import { UploadedFileGetListHandler } from '@/application/queries/uploaded-file-get-list/uploaded-file-get-list.handler';
import { UploadedFileGetListQuery } from '@/application/queries/uploaded-file-get-list/uploaded-file-get-list.query';

describe('UploadedFileGetListHandler', () => {
  let handler: UploadedFileGetListHandler;
  let mockReadService: any;

  beforeEach(() => {
    mockReadService = {
      findAll: jest.fn(),
    };
    handler = new UploadedFileGetListHandler(mockReadService);
  });

  it('should return paginated file list', async () => {
    const paginatedResult = { data: [{ id: 'file-1', url: 'test.jpg' }], total: 1, page: 1, limit: 20 };
    mockReadService.findAll.mockResolvedValue(paginatedResult);

    const filters = { targetId: 'user-123', page: 1, limit: 20 } as any;
    const result = await handler.execute(new UploadedFileGetListQuery(filters));

    expect(result).toEqual(paginatedResult);
    expect(mockReadService.findAll).toHaveBeenCalledWith(filters);
  });

  it('should return empty list when no files match', async () => {
    const paginatedResult = { data: [], total: 0, page: 1, limit: 20 };
    mockReadService.findAll.mockResolvedValue(paginatedResult);

    const filters = { targetId: 'nonexistent', page: 1, limit: 20 } as any;
    const result = await handler.execute(new UploadedFileGetListQuery(filters));

    expect(result.data).toHaveLength(0);
    expect((result as any).total).toBe(0);
  });
});