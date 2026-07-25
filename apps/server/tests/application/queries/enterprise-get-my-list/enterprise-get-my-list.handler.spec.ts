import { EnterpriseGetMyListHandler } from '@/application/queries/enterprise-get-my-list/enterprise-get-my-list.handler';
import { EnterpriseGetMyListQuery } from '@/application/queries/enterprise-get-my-list/enterprise-get-my-list.query';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

describe('EnterpriseGetMyListHandler', () => {
  let handler: EnterpriseGetMyListHandler;
  let mockEnterpriseReadService: any;

  beforeEach(() => {
    mockEnterpriseReadService = {
      findByUserIdOrMember: jest.fn(),
    };
    handler = new EnterpriseGetMyListHandler(mockEnterpriseReadService);
  });

  it('should return paginated list of enterprises for the user', async () => {
    const mockList = new PaginatedResponseDto(
      [{ id: 'ent-123', companyName: 'Enterprise 1' } as any],
      null,
      false,
      10,
    );
    mockEnterpriseReadService.findByUserIdOrMember.mockResolvedValue(mockList);

    const query = new EnterpriseGetMyListQuery('user-123', { limit: 10 });
    const result = await handler.execute(query);

    expect(result).toEqual(mockList);
    expect(mockEnterpriseReadService.findByUserIdOrMember).toHaveBeenCalledWith('user-123', { limit: 10 });
  });

  it('should call findByUserIdOrMember with userId and no filters', async () => {
    const mockList = new PaginatedResponseDto([], null, false, 10);
    mockEnterpriseReadService.findByUserIdOrMember.mockResolvedValue(mockList);

    const query = new EnterpriseGetMyListQuery('user-456');
    const result = await handler.execute(query);

    expect(result).toEqual(mockList);
    expect(mockEnterpriseReadService.findByUserIdOrMember).toHaveBeenCalledWith('user-456', undefined);
  });
});