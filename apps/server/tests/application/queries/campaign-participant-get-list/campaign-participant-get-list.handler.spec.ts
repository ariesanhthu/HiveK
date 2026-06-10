import { CampaignParticipantGetListQueryHandler } from '@/application/queries/campaign-participant-get-list/campaign-participant-get-list.handler';
import { CampaignParticipantGetListQuery } from '@/application/queries/campaign-participant-get-list/campaign-participant-get-list.query';

describe('CampaignParticipantGetListQueryHandler', () => {
  let handler: CampaignParticipantGetListQueryHandler;
  let mockReadService: any;

  beforeEach(() => {
    mockReadService = {
      findAll: jest.fn(),
    };
    handler = new CampaignParticipantGetListQueryHandler(mockReadService);
  });

  it('should call readService.findAll with the query input and return list DTO', async () => {
    const mockListDto = {
      data: [{ id: 'participant-123', campaignId: 'camp-1' }],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };
    mockReadService.findAll.mockResolvedValue(mockListDto);

    const input = { campaignId: 'camp-1', page: 1, limit: 10 };
    const query = new CampaignParticipantGetListQuery(input);
    const result = await handler.execute(query);

    expect(result).toEqual(mockListDto);
    expect(mockReadService.findAll).toHaveBeenCalledWith(input, undefined);
  });
});
