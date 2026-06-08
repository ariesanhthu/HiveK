import { EnterpriseGetListHandler } from '@/application/queries/enterprise-get-list/enterprise-get-list.handler';
import { EnterpriseGetListQuery } from '@/application/queries/enterprise-get-list/enterprise-get-list.query';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

describe('EnterpriseGetListHandler', () => {
  let handler: EnterpriseGetListHandler;
  let mockEnterpriseReadService: any;

  beforeEach(() => {
    mockEnterpriseReadService = {
      findAll: jest.fn(),
    };
    handler = new EnterpriseGetListHandler(mockEnterpriseReadService);
  });

  it('should return paginated list of enterprises', async () => {
    const mockList = new PaginatedResponseDto([{ id: 'ent-123', companyName: 'Enterprise 1' } as any], null);
    mockEnterpriseReadService.findAll.mockResolvedValue(mockList);

    const query = new EnterpriseGetListQuery({ limit: 10 });
    const result = await handler.execute(query);

    expect(result).toEqual(mockList);
    expect(mockEnterpriseReadService.findAll).toHaveBeenCalledWith({ limit: 10 });
  });
});
