import { CampaignParticipantUpdateCommandHandler } from '@/application/commands/campaign-participant-update/campaign-participant-update.handler';
import { CampaignParticipantUpdateCommand } from '@/application/commands/campaign-participant-update/campaign-participant-update.command';
import { CampaignRoot } from '@/core/aggregate-roots';
import { CampaignParticipantEntity } from '@/core/entities';
import { CampaignParticipantNotFoundException } from '@/core/exceptions';
import { EParticipantStatus, ECampaignStatus } from '@/core/enums';

describe('CampaignParticipantUpdateCommandHandler', () => {
  let handler: CampaignParticipantUpdateCommandHandler;
  let mockCampaignRepository: any;

  beforeEach(() => {
    mockCampaignRepository = {
      findByParticipantId: jest.fn(),
      save: jest.fn(),
    };
    handler = new CampaignParticipantUpdateCommandHandler(mockCampaignRepository);
  });

  const createCampaignWithParticipant = (participantId: string, status: EParticipantStatus) => {
    const participant = CampaignParticipantEntity.instantiate(participantId, {
      kolProfileId: 'kol-1',
      status,
      joinedAt: status === EParticipantStatus.PENDING_APPROVAL ? null : new Date(),
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

    const command = new CampaignParticipantUpdateCommand('non-existent', { status: EParticipantStatus.JOINED });
    await expect(handler.execute(command)).rejects.toThrow(CampaignParticipantNotFoundException);
  });

  it('should transition status using join() if target is JOINED and current is PENDING_APPROVAL', async () => {
    const campaign = createCampaignWithParticipant('participant-123', EParticipantStatus.PENDING_APPROVAL);
    mockCampaignRepository.findByParticipantId.mockResolvedValue(campaign);

    const command = new CampaignParticipantUpdateCommand('participant-123', { status: EParticipantStatus.JOINED });
    await handler.execute(command);

    const updated = campaign.participants[0];
    expect(updated.status).toBe(EParticipantStatus.JOINED);
    expect(updated.joinedAt).toBeInstanceOf(Date);
    expect(mockCampaignRepository.save).toHaveBeenCalledWith(campaign);
  });

  it('should transition status to REJECTED when target is REJECTED', async () => {
    const campaign = createCampaignWithParticipant('participant-123', EParticipantStatus.PENDING_APPROVAL);
    mockCampaignRepository.findByParticipantId.mockResolvedValue(campaign);

    const command = new CampaignParticipantUpdateCommand('participant-123', { status: EParticipantStatus.REJECTED });
    await handler.execute(command);

    expect(campaign.participants[0].status).toBe(EParticipantStatus.REJECTED);
    expect(mockCampaignRepository.save).toHaveBeenCalledWith(campaign);
  });
});
