import { UploadedFileGetListHandler } from '@/application/queries/uploaded-file-get-list/uploaded-file-get-list.handler';
import { UploadedFileGetListQuery } from '@/application/queries/uploaded-file-get-list/uploaded-file-get-list.query';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

describe('UploadedFileGetListHandler', () => {
  let handler: UploadedFileGetListHandler;
  let mockReadService: any;

  beforeEach(() => {
    mockReadService = {
      findAll: jest.fn(),
    };
    handler = new UploadedFileGetListHandler(mockReadService);
  });

  it('should return paginated file list with cursor-based pagination', async () => {
    const paginatedResult = new PaginatedResponseDto(
      [{ id: 'file-1', url: 'test.jpg' }],
      null,
      false,
      10,
    );
    mockReadService.findAll.mockResolvedValue(paginatedResult);

    const filters = { targetId: 'user-123', limit: 10 } as any;
    const result = await handler.execute(new UploadedFileGetListQuery(filters));

    expect(result.data).toHaveLength(1);
    expect(result.cursor).toBeNull();
    expect(result.hasNext).toBe(false);
    expect(result.limit).toBe(10);
    expect(mockReadService.findAll).toHaveBeenCalledWith(filters);
  });

  it('should return empty list when no files match', async () => {
    const paginatedResult = new PaginatedResponseDto([], null, false, 10);
    mockReadService.findAll.mockResolvedValue(paginatedResult);

    const filters = { targetId: 'nonexistent', limit: 10 } as any;
    const result = await handler.execute(new UploadedFileGetListQuery(filters));

    expect(result.data).toHaveLength(0);
    expect(result.hasNext).toBe(false);
  });
});
