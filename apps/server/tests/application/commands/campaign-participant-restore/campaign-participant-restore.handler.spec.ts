import { CampaignParticipantRestoreCommand } from '@/application/commands/campaign-participant-restore/campaign-participant-restore.command';
import { CampaignParticipantRestoreCommandHandler } from '@/application/commands/campaign-participant-restore/campaign-participant-restore.handler';
import { CampaignParticipantRoot } from '@/core/aggregate-roots';
import { EParticipantStatus } from '@/core/enums';
import { CampaignParticipantNotFoundException } from '@/core/exceptions';

describe('CampaignParticipantRestoreCommandHandler', () => {
  let handler: CampaignParticipantRestoreCommandHandler;
  let mockParticipantRepository: any;

  beforeEach(() => {
    mockParticipantRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new CampaignParticipantRestoreCommandHandler(mockParticipantRepository);
  });

  it('should throw CampaignParticipantNotFoundException if participant not found', async () => {
    mockParticipantRepository.findById.mockResolvedValue(null);

    const command = new CampaignParticipantRestoreCommand('non-existent');
    await expect(handler.execute(command)).rejects.toThrow(CampaignParticipantNotFoundException);
  });

  it('should restore participant successfully', async () => {
    const participant = CampaignParticipantRoot.instantiate('participant-123', {
      campaignId: 'camp-1',
      kolProfileId: 'kol-1',
      status: EParticipantStatus.JOINED,
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      outputs: [],
      deleteAt: new Date(),
      deleteBy: 'admin-user',
    } as any);

    mockParticipantRepository.findById.mockResolvedValue(participant);

    const command = new CampaignParticipantRestoreCommand('participant-123');
    await handler.execute(command);

    expect(participant.deleteAt).toBeNull();
    expect(participant.deleteBy).toBeNull();
    expect(mockParticipantRepository.save).toHaveBeenCalledWith(participant);
  });
});
