import { CampaignInviteCollaboratorCommandHandler } from '@/application/commands/campaign-invite-collaborator/campaign-invite-collaborator.handler';
import { CampaignInviteCollaboratorCommand } from '@/application/commands/campaign-invite-collaborator/campaign-invite-collaborator.command';
import { CampaignRoot } from '@/core/aggregate-roots/campaign.aggregate';
import { CampaignNotFoundException, UserNotFoundException, InvalidOperationException } from '@/core/exceptions';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';

describe('CampaignInviteCollaboratorCommandHandler', () => {
  let handler: CampaignInviteCollaboratorCommandHandler;
  let mockCampaignRepository: any;
  let mockUserRepository: any;
  let mockMailerService: any;
  let mockUow: any;

  beforeEach(() => {
    mockCampaignRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockUserRepository = {
      findByIds: jest.fn(),
    };
    mockMailerService = {
      sendMail: jest.fn(),
    };
    mockUow = {
      execute: jest.fn((fn: any) => fn()),
    };
    handler = new CampaignInviteCollaboratorCommandHandler(
      mockCampaignRepository,
      mockUserRepository,
      mockMailerService,
      mockUow,
    );
  });

  const campaignId = 'campaign-123';
  const ownerId = 'owner-456';
  const collaboratorId = 'collab-789';

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

  it('should successfully invite collaborators and send emails', async () => {
    const campaign = createMockCampaign();
    mockCampaignRepository.findById.mockResolvedValue(campaign);
    mockUserRepository.findByIds.mockResolvedValue([{ id: collaboratorId, email: 'collab@test.com' }]);

    const command = new CampaignInviteCollaboratorCommand(campaignId, { memberIds: [collaboratorId] }, ownerId);
    await handler.execute(command);

    expect(campaign.collaboratorIds).toContain(collaboratorId);
    expect(mockCampaignRepository.save).toHaveBeenCalledWith(campaign);
    expect(mockMailerService.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'collab@test.com',
      subject: 'Invitation to Collaborate on Campaign',
    }));
  });

  it('should throw CampaignNotFoundException if campaign does not exist', async () => {
    mockCampaignRepository.findById.mockResolvedValue(null);
    const command = new CampaignInviteCollaboratorCommand(campaignId, { memberIds: [collaboratorId] }, ownerId);

    await expect(handler.execute(command)).rejects.toThrow(CampaignNotFoundException);
  });

  it('should throw UserNotFoundException if some users do not exist', async () => {
    const campaign = createMockCampaign();
    mockCampaignRepository.findById.mockResolvedValue(campaign);
    mockUserRepository.findByIds.mockResolvedValue([]); // No users found

    const command = new CampaignInviteCollaboratorCommand(campaignId, { memberIds: [collaboratorId] }, ownerId);

    await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
  });

  it('should throw InvalidOperationException if requester is not the owner', async () => {
    const campaign = createMockCampaign();
    mockCampaignRepository.findById.mockResolvedValue(campaign);
    mockUserRepository.findByIds.mockResolvedValue([{ id: collaboratorId }]);

    const command = new CampaignInviteCollaboratorCommand(campaignId, { memberIds: [collaboratorId] }, 'wrong-owner');

    await expect(handler.execute(command)).rejects.toThrow(InvalidOperationException);
  });
});
