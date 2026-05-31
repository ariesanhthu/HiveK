import { UserGetListHandler } from '@/application/queries/user-get-list/user-get-list.handler';
import { UserGetListQuery } from '@/application/queries/user-get-list/user-get-list.query';

describe('UserGetListHandler', () => {
  let handler: UserGetListHandler;
  let mockUserReadService: any;

  beforeEach(() => {
    mockUserReadService = {
      findAll: jest.fn(),
    };
    handler = new UserGetListHandler(mockUserReadService);
  });

  it('should call findAll on the read service with filters', async () => {
    const mockFilters = { email: 'test@test.com' } as any;
    const mockResult = { data: [], cursor: null };
    mockUserReadService.findAll.mockResolvedValue(mockResult);

    const query = new UserGetListQuery(mockFilters);
    const result = await handler.execute(query);

    expect(result).toBe(mockResult);
    expect(mockUserReadService.findAll).toHaveBeenCalledWith(mockFilters);
  });
});
