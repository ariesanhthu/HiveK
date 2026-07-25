import { CampaignParticipantSoftDeleteCommandHandler } from '@/application/commands/campaign-participant-soft-delete/campaign-participant-soft-delete.handler';
import { CampaignParticipantSoftDeleteCommand } from '@/application/commands/campaign-participant-soft-delete/campaign-participant-soft-delete.command';
import { CampaignRoot } from '@/core/aggregate-roots';
import { CampaignParticipantEntity } from '@/core/entities';
import { CampaignParticipantNotFoundException } from '@/core/exceptions';
import { EParticipantStatus, ECampaignStatus } from '@/core/enums';

describe('CampaignParticipantSoftDeleteCommandHandler', () => {
  let handler: CampaignParticipantSoftDeleteCommandHandler;
  let mockCampaignRepository: any;

  beforeEach(() => {
    mockCampaignRepository = {
      findByParticipantId: jest.fn(),
      save: jest.fn(),
    };
    handler = new CampaignParticipantSoftDeleteCommandHandler(mockCampaignRepository);
  });

  it('should throw CampaignParticipantNotFoundException if campaign not found', async () => {
    mockCampaignRepository.findByParticipantId.mockResolvedValue(null);

    const command = new CampaignParticipantSoftDeleteCommand('non-existent', 'admin-user');
    await expect(handler.execute(command)).rejects.toThrow(CampaignParticipantNotFoundException);
  });

  it('should soft delete participant successfully', async () => {
    const participant = CampaignParticipantEntity.instantiate('participant-123', {
      kolProfileId: 'kol-1',
      status: EParticipantStatus.JOINED,
      joinedAt: new Date(),
      deleteAt: null,
      deleteBy: null,
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

    const command = new CampaignParticipantSoftDeleteCommand('participant-123', 'admin-user');
    await handler.execute(command);

    const updated = campaign.participants[0];
    expect(updated.deleteAt).toBeInstanceOf(Date);
    expect(updated.deleteBy).toBe('admin-user');
    expect(mockCampaignRepository.save).toHaveBeenCalledWith(campaign);
  });
});
