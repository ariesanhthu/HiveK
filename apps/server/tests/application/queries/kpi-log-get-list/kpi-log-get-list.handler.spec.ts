import { KpiLogGetListHandler } from '@/application/queries/kpi-log-get-list/kpi-log-get-list.handler';
import { KpiLogGetListQuery } from '@/application/queries/kpi-log-get-list/kpi-log-get-list.query';

describe('KpiLogGetListHandler', () => {
  let handler: KpiLogGetListHandler;
  let mockKpiLogReadService: any;

  beforeEach(() => {
    mockKpiLogReadService = {
      findAll: jest.fn(),
    };
    handler = new KpiLogGetListHandler(mockKpiLogReadService);
  });

  it('should get kpi logs successfully', async () => {
    const mockResponse = {
      data: [],
      meta: {
        hasNextPage: false,
        nextCursor: null,
      },
    };
    mockKpiLogReadService.findAll.mockResolvedValue(mockResponse);

    const query = new KpiLogGetListQuery({ limit: 10, sort: 'desc' } as any);
    const result = await handler.execute(query);

    expect(result).toEqual(mockResponse);
    expect(mockKpiLogReadService.findAll).toHaveBeenCalledWith({ limit: 10, sort: 'desc' });
  });
});
