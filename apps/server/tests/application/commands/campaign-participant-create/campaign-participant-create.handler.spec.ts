import { CampaignParticipantCreateCommandHandler } from '@/application/commands/campaign-participant-create/campaign-participant-create.handler';
import { CampaignParticipantCreateCommand } from '@/application/commands/campaign-participant-create/campaign-participant-create.command';
import { CampaignParticipantRoot, CampaignRoot } from '@/core/aggregate-roots';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';

describe('CampaignParticipantCreateCommandHandler', () => {
  let handler: CampaignParticipantCreateCommandHandler;
  let mockParticipantRepository: any;
  let mockCampaignRepository: any;

  beforeEach(() => {
    mockParticipantRepository = {
      findByCampaignAndKol: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockImplementation((p: CampaignParticipantRoot) => {
        p.setId('participant-id-123');
        return Promise.resolve();
      }),
    };

    const mockCampaign = CampaignRoot.instantiate('campaign-123', {
      ownerId: 'owner-1',
      enterpriseId: 'enterprise-1',
      budget: 5000,
      financialTarget: {},
      description: 'Test Campaign',
      platformTarget: [],
      status: ECampaignStatus.FINDING_KOL,
      collaboratorIds: ['owner-1'],
      rawContents: [],
      deleteAt: null,
      deleteBy: null,
    });

    mockCampaignRepository = {
      findById: jest.fn().mockResolvedValue(mockCampaign),
      save: jest.fn().mockResolvedValue(undefined),
    };

    handler = new CampaignParticipantCreateCommandHandler(
      mockParticipantRepository,
      mockCampaignRepository,
    );
  });

  it('should successfully create a new campaign participant', async () => {
    const input = {
      campaignId: 'campaign-123',
      kolProfileId: 'kol-123',
    };

    const command = new CampaignParticipantCreateCommand(input);
    const result = await handler.execute(command);

    expect(result).toBe('participant-id-123');
    expect(mockParticipantRepository.save).toHaveBeenCalled();
  });
});
