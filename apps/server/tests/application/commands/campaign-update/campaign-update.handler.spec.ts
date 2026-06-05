import { UpdateCampaignHandler } from '@/application/commands/campaign-update/campaign-update.handler';
import { CampaignUpdateCommand } from '@/application/commands/campaign-update/campaign-update.command';
import { CampaignNotFoundException } from '@/core/exceptions';
import { CampaignRoot } from '@/core/aggregate-roots';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';

describe('UpdateCampaignHandler', () => {
  let handler: UpdateCampaignHandler;
  let mockCampaignRepository: any;

  beforeEach(() => {
    mockCampaignRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new UpdateCampaignHandler(mockCampaignRepository);
  });

  it('should update a campaign successfully', async () => {
    const mockCampaign = CampaignRoot.instantiate('campaign-123', {
      ownerId: 'owner-id',
      enterpriseId: 'enterprise-id',
      budget: 5000,
      financialTarget: {},
      description: 'Summer sale campaign',
      platformTarget: [],
      status: ECampaignStatus.DRAFT,
      collaboratorIds: ['owner-id'],
      rawContents: [],
      deleteAt: null,
      deleteBy: null,
    });

    mockCampaignRepository.findById.mockResolvedValue(mockCampaign);

    const input = {
      description: 'Updated Description',
      budget: 6000,
    };

    const command = new CampaignUpdateCommand('campaign-123', input as any);
    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(mockCampaignRepository.findById).toHaveBeenCalledWith('campaign-123');
    expect(result.description).toBe('Updated Description');
    expect(result.budget).toBe(6000);
    expect(mockCampaignRepository.save).toHaveBeenCalledWith(mockCampaign);
  });

  it('should throw NotFoundException if campaign not found', async () => {
    mockCampaignRepository.findById.mockResolvedValue(null);

    const command = new CampaignUpdateCommand('campaign-123', {});
    await expect(handler.execute(command)).rejects.toThrow(CampaignNotFoundException);
  });
});
