import { CampaignParticipantRestoreCommandHandler } from '@/application/commands/campaign-participant-restore/campaign-participant-restore.handler';
import { CampaignParticipantRestoreCommand } from '@/application/commands/campaign-participant-restore/campaign-participant-restore.command';
import { CampaignRoot } from '@/core/aggregate-roots';
import { CampaignParticipantEntity } from '@/core/entities';
import { CampaignParticipantNotFoundException } from '@/core/exceptions';
import { EParticipantStatus, ECampaignStatus } from '@/core/enums';

describe('CampaignParticipantRestoreCommandHandler', () => {
  let handler: CampaignParticipantRestoreCommandHandler;
  let mockCampaignRepository: any;

  beforeEach(() => {
    mockCampaignRepository = {
      findByParticipantId: jest.fn(),
      save: jest.fn(),
    };
    handler = new CampaignParticipantRestoreCommandHandler(mockCampaignRepository);
  });

  it('should throw CampaignParticipantNotFoundException if campaign not found', async () => {
    mockCampaignRepository.findByParticipantId.mockResolvedValue(null);

    const command = new CampaignParticipantRestoreCommand('non-existent');
    await expect(handler.execute(command)).rejects.toThrow(CampaignParticipantNotFoundException);
  });

  it('should restore participant successfully', async () => {
    const participant = CampaignParticipantEntity.instantiate('participant-123', {
      kolProfileId: 'kol-1',
      status: EParticipantStatus.JOINED,
      joinedAt: new Date(),
      deleteAt: new Date(),
      deleteBy: 'admin-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const campaign = CampaignRoot.instantiate('campaign-123', {
      ownerId: 'owner-1',
      enterpriseId: 'ent-1',
      budget: 5000,
      financialTarget: {},
      description: 'Test Campaign',
      platformTarget: [],
      status: ECampaignStatus.IN_PROGRESS,
      collaboratorIds: [],
      rawContents: [],
      deleteAt: null,
      deleteBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      participants: [participant],
    });

    mockCampaignRepository.findByParticipantId.mockResolvedValue(campaign);

    const command = new CampaignParticipantRestoreCommand('participant-123');
    await handler.execute(command);

    const updated = campaign.participants[0];
    expect(updated.deleteAt).toBeNull();
    expect(updated.deleteBy).toBeNull();
    expect(mockCampaignRepository.save).toHaveBeenCalledWith(campaign);
  });
});
