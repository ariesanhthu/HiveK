import { CampaignParticipantHardDeleteCommandHandler } from '@/application/commands/campaign-participant-hard-delete/campaign-participant-hard-delete.handler';
import { CampaignParticipantHardDeleteCommand } from '@/application/commands/campaign-participant-hard-delete/campaign-participant-hard-delete.command';
import { CampaignRoot } from '@/core/aggregate-roots';
import { CampaignParticipantEntity } from '@/core/entities';
import { CampaignParticipantNotFoundException, InvalidOperationException } from '@/core/exceptions';
import { EParticipantStatus, ECampaignStatus } from '@/core/enums';

describe('CampaignParticipantHardDeleteCommandHandler', () => {
  let handler: CampaignParticipantHardDeleteCommandHandler;
  let mockCampaignRepository: any;

  beforeEach(() => {
    mockCampaignRepository = {
      findByParticipantId: jest.fn(),
      save: jest.fn(),
    };
    handler = new CampaignParticipantHardDeleteCommandHandler(mockCampaignRepository);
  });

  const createCampaignWithParticipant = (participantId: string, status: EParticipantStatus) => {
    const participant = CampaignParticipantEntity.instantiate(participantId, {
      kolProfileId: 'kol-1',
      status,
      joinedAt: status === EParticipantStatus.REJECTED ? null : new Date(),
      deleteAt: null,
      deleteBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return CampaignRoot.instantiate('campaign-123', {
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
  };

  it('should throw CampaignParticipantNotFoundException if campaign not found', async () => {
    mockCampaignRepository.findByParticipantId.mockResolvedValue(null);

    const command = new CampaignParticipantHardDeleteCommand('non-existent');
    await expect(handler.execute(command)).rejects.toThrow(CampaignParticipantNotFoundException);
  });

  it('should throw InvalidOperationException if participant status is not REJECTED', async () => {
    const campaign = createCampaignWithParticipant('participant-123', EParticipantStatus.JOINED);
    mockCampaignRepository.findByParticipantId.mockResolvedValue(campaign);

    const command = new CampaignParticipantHardDeleteCommand('participant-123');
    await expect(handler.execute(command)).rejects.toThrow(InvalidOperationException);
  });

  it('should hard delete participant successfully when status is REJECTED', async () => {
    const campaign = createCampaignWithParticipant('participant-123', EParticipantStatus.REJECTED);
    mockCampaignRepository.findByParticipantId.mockResolvedValue(campaign);

    const command = new CampaignParticipantHardDeleteCommand('participant-123');
    await handler.execute(command);

    expect(campaign.participants.length).toBe(0);
    expect(mockCampaignRepository.save).toHaveBeenCalledWith(campaign);
  });
});
