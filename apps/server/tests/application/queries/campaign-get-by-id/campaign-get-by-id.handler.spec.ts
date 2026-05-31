import { CampaignGetByIdHandler } from '@/application/queries/campaign-get-by-id/campaign-get-by-id.handler';
import { CampaignGetByIdQuery } from '@/application/queries/campaign-get-by-id/campaign-get-by-id.query';
import { CampaignNotFoundException } from '@/core/exceptions';

describe('CampaignGetByIdHandler', () => {
  let handler: CampaignGetByIdHandler;
  let mockCampaignReadService: any;

  beforeEach(() => {
    mockCampaignReadService = {
      findById: jest.fn(),
    };
    handler = new CampaignGetByIdHandler(mockCampaignReadService);
  });

  it('should return campaign when found', async () => {
    const mockCampaign = { id: 'campaign-123', campaign: { name: 'Campaign 1' } };
    mockCampaignReadService.findById.mockResolvedValue(mockCampaign);

    const query = new CampaignGetByIdQuery('campaign-123');
    const result = await handler.execute(query);

    expect(result).toEqual(mockCampaign);
    expect(mockCampaignReadService.findById).toHaveBeenCalledWith('campaign-123');
  });

  it('should throw NotFoundException when campaign not found', async () => {
    mockCampaignReadService.findById.mockResolvedValue(null);

    const query = new CampaignGetByIdQuery('campaign-123');
    await expect(handler.execute(query)).rejects.toThrow(CampaignNotFoundException);
  });
});
