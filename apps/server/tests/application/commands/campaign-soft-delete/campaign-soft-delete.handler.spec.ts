import { CampaignSoftDeleteCommand } from '@/application/commands/campaign-soft-delete/campaign-soft-delete.command';
import { CampaignSoftDeleteCommandHandler } from '@/application/commands/campaign-soft-delete/campaign-soft-delete.handler';
import { CampaignForbiddenException, CampaignNotFoundException } from '@/core/exceptions';

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

  it('should soft delete a campaign if requested by owner', async () => {
    const campaign = { id: 'campaign-1', ownerId: 'owner-id', softDelete: jest.fn() };
    mockCampaignRepository.findById.mockResolvedValue(campaign);

    await handler.execute(new CampaignSoftDeleteCommand('campaign-1', 'owner-id', 'owner-id'));

    expect(campaign.softDelete).toHaveBeenCalledWith('owner-id');
    expect(mockCampaignRepository.save).toHaveBeenCalledWith(campaign);
  });

  it('should throw ForbiddenException if requested by non-owner', async () => {
    const campaign = { id: 'campaign-1', ownerId: 'owner-id', softDelete: jest.fn() };
    mockCampaignRepository.findById.mockResolvedValue(campaign);

    await expect(
      handler.execute(new CampaignSoftDeleteCommand('campaign-1', 'not-owner', 'not-owner')),
    )
      .rejects.toThrow(CampaignForbiddenException);
  });

  it('should throw CampaignNotFoundException when campaign not found', async () => {
    mockCampaignRepository.findById.mockResolvedValue(null);

    await expect(handler.execute(new CampaignSoftDeleteCommand('nonexistent', 'any', 'any')))
      .rejects.toThrow(CampaignNotFoundException);
    expect(mockCampaignRepository.save).not.toHaveBeenCalled();
  });
});
