import { CampaignParticipantCreateCommandHandler } from '@/application/commands/campaign-participant-create/campaign-participant-create.handler';
import { CampaignParticipantCreateCommand } from '@/application/commands/campaign-participant-create/campaign-participant-create.command';
import { CampaignRoot } from '@/core/aggregate-roots';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';
import { UNIT_OF_WORK, EVENT_SERVICE } from '@/application/interfaces';
import { KOL_PROFILE_REPOSITORY } from '@/core/interfaces/repositories/kol-profile.repository';
import { CAMPAIGN_REPOSITORY } from '@/core/interfaces/repositories';

describe('CampaignParticipantCreateCommandHandler', () => {
  let handler: CampaignParticipantCreateCommandHandler;
  let mockCampaignRepository: any;
  let mockKolProfileRepository: any;
  let mockEventService: any;
  let mockUow: any;

  beforeEach(() => {
    mockCampaignRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    mockKolProfileRepository = {
      findById: jest.fn(),
    };

    mockEventService = {
      publishEvents: jest.fn(),
    };

    mockUow = {
      execute: jest.fn((fn: () => Promise<any>) => fn()),
    };

    handler = new CampaignParticipantCreateCommandHandler(
      mockCampaignRepository,
      mockKolProfileRepository,
      mockEventService,
      mockUow,
    );
  });

  it('should successfully create a new campaign participant', async () => {
    const campaign = CampaignRoot.instantiate('campaign-123', {
      ownerId: 'owner-1',
      enterpriseId: 'enterprise-1',
      budget: 5000,
      financialTarget: {},
      description: 'Test Campaign',
      platformTarget: [],
      status: ECampaignStatus.FINDING_KOL,
      collaboratorIds: [],
      rawContents: [],
      deleteAt: null,
      deleteBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      participants: [],
    });

    mockCampaignRepository.findById.mockResolvedValue(campaign);
    mockKolProfileRepository.findById.mockResolvedValue({ id: 'kol-123', userId: 'user-456', email: 'kol@test.com' });

    const input = { campaignId: 'campaign-123', kolProfileId: 'kol-123' };
    const command = new CampaignParticipantCreateCommand(input);
    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(campaign.participants.length).toBe(1);
    expect(mockCampaignRepository.save).toHaveBeenCalledWith(campaign);
    expect(mockEventService.publishEvents).toHaveBeenCalledWith(campaign);
  });
});
