import { CampaignParticipantGetByIdQueryHandler } from '@/application/queries/campaign-participant-get-by-id/campaign-participant-get-by-id.handler';
import { CampaignParticipantGetByIdQuery } from '@/application/queries/campaign-participant-get-by-id/campaign-participant-get-by-id.query';
import { CampaignParticipantNotFoundException } from '@/core/exceptions';

describe('CampaignParticipantGetByIdQueryHandler', () => {
  let handler: CampaignParticipantGetByIdQueryHandler;
  let mockReadService: any;

  beforeEach(() => {
    mockReadService = {
      findById: jest.fn(),
    };
    handler = new CampaignParticipantGetByIdQueryHandler(mockReadService);
  });

  it('should return the participant DTO when found', async () => {
    const mockDto = { id: 'participant-123', campaignId: 'camp-1' };
    mockReadService.findById.mockResolvedValue(mockDto);

    const query = new CampaignParticipantGetByIdQuery('participant-123');
    const result = await handler.execute(query);

    expect(result).toEqual(mockDto);
    expect(mockReadService.findById).toHaveBeenCalledWith('participant-123', undefined);
  });

  it('should throw CampaignParticipantNotFoundException when not found', async () => {
    mockReadService.findById.mockResolvedValue(null);

    const query = new CampaignParticipantGetByIdQuery('participant-123');
    await expect(handler.execute(query)).rejects.toThrow(CampaignParticipantNotFoundException);
  });
});
