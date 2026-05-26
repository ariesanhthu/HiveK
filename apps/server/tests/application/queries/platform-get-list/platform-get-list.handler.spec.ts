import { PlatformGetListHandler } from '@/application/queries/platform-get-list/platform-get-list.handler';
import { PlatformGetListQuery } from '@/application/queries/platform-get-list/platform-get-list.query';

describe('PlatformGetListHandler', () => {
  let handler: PlatformGetListHandler;
  let mockPlatformReadService: any;

  beforeEach(() => {
    mockPlatformReadService = {
      findAll: jest.fn(),
    };
    handler = new PlatformGetListHandler(mockPlatformReadService);
  });

  it('should get platforms successfully', async () => {
    const mockResponse = {
      data: [],
      meta: {
        hasNextPage: false,
        nextCursor: null,
      },
    };
    mockPlatformReadService.findAll.mockResolvedValue(mockResponse);

    const query = new PlatformGetListQuery({ limit: 10, sort: 'desc' } as any);
    const result = await handler.execute(query);

    expect(result).toEqual(mockResponse);
    expect(mockPlatformReadService.findAll).toHaveBeenCalledWith({ limit: 10, sort: 'desc' });
  });
});
