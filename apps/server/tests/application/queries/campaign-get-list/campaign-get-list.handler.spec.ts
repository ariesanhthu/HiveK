import { CampaignGetListHandler } from '@/application/queries/campaign-get-list/campaign-get-list.handler';
import { CampaignGetListQuery } from '@/application/queries/campaign-get-list/campaign-get-list.query';

describe('CampaignGetListHandler', () => {
  let handler: CampaignGetListHandler;
  let mockCampaignReadService: any;

  beforeEach(() => {
    mockCampaignReadService = {
      findAll: jest.fn(),
    };
    handler = new CampaignGetListHandler(mockCampaignReadService);
  });

  it('should get campaigns successfully', async () => {
    const mockResponse = {
      data: [],
      meta: {
        hasNextPage: false,
        nextCursor: null,
      },
    };
    mockCampaignReadService.findAll.mockResolvedValue(mockResponse);

    const query = new CampaignGetListQuery({ limit: 10, sort: 'desc' } as any);
    const result = await handler.execute(query);

    expect(result).toEqual(mockResponse);
    expect(mockCampaignReadService.findAll).toHaveBeenCalledWith(
      { limit: 10, sort: 'desc' },
      undefined,
    );
  });
});
