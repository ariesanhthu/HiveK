import { CampaignParticipantCreateCommandHandler } from '@/application/commands/campaign-participant-create/campaign-participant-create.handler';
import { CampaignParticipantCreateCommand } from '@/application/commands/campaign-participant-create/campaign-participant-create.command';
import { CampaignParticipantRoot } from '@/core/aggregate-roots';
import { EParticipantStatus } from '@/core/enums';

describe('CampaignParticipantCreateCommandHandler', () => {
  let handler: CampaignParticipantCreateCommandHandler;
  let mockParticipantRepository: any;

  beforeEach(() => {
    mockParticipantRepository = {
      findByCampaignAndKol: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockImplementation((p: CampaignParticipantRoot) => {
        p.setId('participant-id-123');
        return Promise.resolve();
      }),
    };
    handler = new CampaignParticipantCreateCommandHandler(mockParticipantRepository);
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
