import { CampaignUpdateStatusCommandHandler } from '@/application/commands/campaign-update-status/campaign-update-status.handler';
import { CampaignUpdateStatusCommand } from '@/application/commands/campaign-update-status/campaign-update-status.command';
import { CampaignRoot } from '@/core/aggregate-roots/campaign.aggregate';
import { CampaignNotFoundException, CampaignForbiddenException } from '@/core/exceptions';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';

describe('CampaignUpdateStatusCommandHandler', () => {
  let handler: CampaignUpdateStatusCommandHandler;
  let mockCampaignRepository: any;

  beforeEach(() => {
    mockCampaignRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new CampaignUpdateStatusCommandHandler(mockCampaignRepository);
  });

  const campaignId = 'campaign-123';
  const ownerId = 'owner-456';

  const createMockCampaign = () => {
    return CampaignRoot.instantiate(campaignId, {
      ownerId,
      enterpriseId: 'ent-123',
      budget: 1000,
      financialTarget: {},
      description: 'Test Campaign',
      platformTarget: [],
      status: ECampaignStatus.DRAFT,
      collaboratorIds: [],
      rawContents: [],
      deleteAt: null,
      deleteBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  it('should successfully update campaign status', async () => {
    const campaign = createMockCampaign();
    mockCampaignRepository.findById.mockResolvedValue(campaign);

    const command = new CampaignUpdateStatusCommand(campaignId, ownerId, ECampaignStatus.ACTIVE);
    await handler.execute(command);

    expect(campaign.status).toBe(ECampaignStatus.ACTIVE);
    expect(mockCampaignRepository.save).toHaveBeenCalledWith(campaign);
  });

  it('should throw CampaignNotFoundException if campaign does not exist', async () => {
    mockCampaignRepository.findById.mockResolvedValue(null);
    const command = new CampaignUpdateStatusCommand(campaignId, ownerId, ECampaignStatus.ACTIVE);

    await expect(handler.execute(command)).rejects.toThrow(CampaignNotFoundException);
  });

  it('should throw CampaignForbiddenException if requester is not the owner', async () => {
    const campaign = createMockCampaign();
    mockCampaignRepository.findById.mockResolvedValue(campaign);

    const command = new CampaignUpdateStatusCommand(campaignId, 'wrong-owner', ECampaignStatus.ACTIVE);

    await expect(handler.execute(command)).rejects.toThrow(CampaignForbiddenException);
  });
});
