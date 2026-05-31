import { RoleGetListQueryHandler } from '@/application/queries/role-get-list/role-get-list.handler';
import { RoleGetListQuery } from '@/application/queries/role-get-list/role-get-list.query';

describe('RoleGetListQueryHandler', () => {
  let handler: RoleGetListQueryHandler;
  let mockRoleReadService: any;

  beforeEach(() => {
    mockRoleReadService = {
      findAll: jest.fn(),
    };
    handler = new RoleGetListQueryHandler(mockRoleReadService);
  });

  it('should call findAll on the read service with filters', async () => {
    const mockFilters = { title: 'Admin' } as any;
    const mockResult = { data: [], cursor: null };
    mockRoleReadService.findAll.mockResolvedValue(mockResult);

    const query = new RoleGetListQuery(mockFilters);
    const result = await handler.execute(query);

    expect(result).toBe(mockResult);
    expect(mockRoleReadService.findAll).toHaveBeenCalledWith(mockFilters);
  });
});
