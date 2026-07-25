import { CampaignUpdateCommandHandler } from '@/application/commands/campaign-update/campaign-update.handler';
import { CampaignUpdateCommand } from '@/application/commands/campaign-update/campaign-update.command';
import { CampaignNotFoundException, CampaignForbiddenException } from '@/core/exceptions';
import { CampaignRoot } from '@/core/aggregate-roots';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';

describe('CampaignUpdateCommandHandler', () => {
  let handler: CampaignUpdateCommandHandler;
  let mockCampaignRepository: any;

  beforeEach(() => {
    mockCampaignRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new CampaignUpdateCommandHandler(mockCampaignRepository);
  });

  it('should update a campaign successfully if requested by owner', async () => {
    const mockCampaign = CampaignRoot.instantiate('campaign-123', {
      ownerId: 'owner-id',
      enterpriseId: 'enterprise-id',
      budget: 5000,
      financialTarget: {},
      description: 'Summer sale campaign',
      platformTarget: [],
      status: ECampaignStatus.DRAFT,
      collaboratorIds: [],
      rawContents: [],
      deleteAt: null,
      deleteBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      participants: [],
    });

    mockCampaignRepository.findById.mockResolvedValue(mockCampaign);

    const input = {
      description: 'Updated Description',
      budget: 6000,
    };

    const command = new CampaignUpdateCommand('campaign-123', 'owner-id', input as any);
    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(mockCampaignRepository.findById).toHaveBeenCalledWith('campaign-123');
    expect(result.description).toBe('Updated Description');
    expect(result.budget).toBe(6000);
    expect(mockCampaignRepository.save).toHaveBeenCalledWith(mockCampaign);
  });

  it('should update a campaign successfully if requested by collaborator', async () => {
    const mockCampaign = CampaignRoot.instantiate('campaign-123', {
      ownerId: 'owner-id',
      enterpriseId: 'enterprise-id',
      budget: 5000,
      financialTarget: {},
      description: 'Summer sale campaign',
      platformTarget: [],
      status: ECampaignStatus.DRAFT,
      collaboratorIds: ['collab-id'],
      rawContents: [],
      deleteAt: null,
      deleteBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      participants: [],
    });

    mockCampaignRepository.findById.mockResolvedValue(mockCampaign);

    const input = {
      description: 'Updated by collaborator',
    };

    const command = new CampaignUpdateCommand('campaign-123', 'collab-id', input as any);
    await handler.execute(command);

    expect(mockCampaign.description).toBe('Updated by collaborator');
    expect(mockCampaignRepository.save).toHaveBeenCalledWith(mockCampaign);
  });

  it('should throw ForbiddenException if user is not owner or collaborator', async () => {
    const mockCampaign = CampaignRoot.instantiate('campaign-123', {
      ownerId: 'owner-id',
      enterpriseId: 'enterprise-id',
      budget: 5000,
      financialTarget: {},
      description: 'Summer sale campaign',
      platformTarget: [],
      status: ECampaignStatus.DRAFT,
      collaboratorIds: [],
      rawContents: [],
      deleteAt: null,
      deleteBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      participants: [],
    });

    mockCampaignRepository.findById.mockResolvedValue(mockCampaign);

    const command = new CampaignUpdateCommand('campaign-123', 'other-user', {});
    await expect(handler.execute(command)).rejects.toThrow(CampaignForbiddenException);
  });

  it('should throw NotFoundException if campaign not found', async () => {
    mockCampaignRepository.findById.mockResolvedValue(null);

    const command = new CampaignUpdateCommand('campaign-123', 'owner-id', {});
    await expect(handler.execute(command)).rejects.toThrow(CampaignNotFoundException);
  });
});
