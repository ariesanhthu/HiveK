import { CampaignHardDeleteCommand } from '@/application/commands/campaign-hard-delete/campaign-hard-delete.command';
import { CampaignHardDeleteCommandHandler } from '@/application/commands/campaign-hard-delete/campaign-hard-delete.handler';
import { CampaignRoot } from '@/core/aggregate-roots';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';
import { CampaignNotFoundException } from '@/core/exceptions';

describe('CampaignHardDeleteCommandHandler', () => {
  let handler: CampaignHardDeleteCommandHandler;
  let mockCampaignRepository: any;

  beforeEach(() => {
    mockCampaignRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };
    handler = new CampaignHardDeleteCommandHandler(mockCampaignRepository);
  });

  it('should delete campaign successfully', async () => {
    const campaign = CampaignRoot.instantiate('campaign-123', {
      ownerId: 'owner-1',
      enterpriseId: 'enterprise-1',
      budget: 5000,
      financialTarget: {},
      description: 'Test Campaign',
      platformTarget: [],
      status: ECampaignStatus.DRAFT,
      collaboratorIds: ['owner-1'],
      rawContents: [],
      deleteAt: null,
      deleteBy: null,
    });

    mockCampaignRepository.findById.mockResolvedValue(campaign);
    const command = new CampaignHardDeleteCommand('campaign-123');

    await handler.execute(command);

    expect(mockCampaignRepository.findById).toHaveBeenCalledWith('campaign-123');
    expect(mockCampaignRepository.delete).toHaveBeenCalledWith('campaign-123');
  });

  it('should throw NotFoundException if campaign to delete not found', async () => {
    mockCampaignRepository.findById.mockResolvedValue(null);
    const command = new CampaignHardDeleteCommand('campaign-123');

    await expect(handler.execute(command)).rejects.toThrow(CampaignNotFoundException);
    expect(mockCampaignRepository.delete).not.toHaveBeenCalled();
  });
});
