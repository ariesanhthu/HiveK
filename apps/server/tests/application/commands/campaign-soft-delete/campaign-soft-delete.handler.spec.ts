import { CampaignSoftDeleteCommandHandler } from '@/application/commands/campaign-soft-delete/campaign-soft-delete.handler';
import { CampaignSoftDeleteCommand } from '@/application/commands/campaign-soft-delete/campaign-soft-delete.command';
import { CampaignNotFoundException } from '@/core/exceptions';

describe('CampaignSoftDeleteCommandHandler', () => {
  let handler: CampaignSoftDeleteCommandHandler;
  let mockCampaignRepository: any;

  beforeEach(() => {
    mockCampaignRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new CampaignSoftDeleteCommandHandler(mockCampaignRepository);
  });

  it('should soft delete a campaign by id', async () => {
    const campaign = { id: 'campaign-1', softDelete: jest.fn() };
    mockCampaignRepository.findById.mockResolvedValue(campaign);

    await handler.execute(new CampaignSoftDeleteCommand('campaign-1', 'user-1'));

    expect(campaign.softDelete).toHaveBeenCalledWith('user-1');
    expect(mockCampaignRepository.save).toHaveBeenCalledWith(campaign);
  });

  it('should use default deletor as "system" when not provided', async () => {
    const campaign = { id: 'campaign-1', softDelete: jest.fn() };
    mockCampaignRepository.findById.mockResolvedValue(campaign);

    await handler.execute(new CampaignSoftDeleteCommand('campaign-1'));

    expect(campaign.softDelete).toHaveBeenCalledWith('system');
  });

  it('should throw CampaignNotFoundException when campaign not found', async () => {
    mockCampaignRepository.findById.mockResolvedValue(null);

    await expect(handler.execute(new CampaignSoftDeleteCommand('nonexistent'))).rejects.toThrow(CampaignNotFoundException);
    expect(mockCampaignRepository.save).not.toHaveBeenCalled();
  });
});