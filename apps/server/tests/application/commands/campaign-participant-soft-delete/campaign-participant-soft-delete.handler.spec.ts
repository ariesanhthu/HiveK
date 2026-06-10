import { CampaignParticipantSoftDeleteCommandHandler } from '@/application/commands/campaign-participant-soft-delete/campaign-participant-soft-delete.handler';
import { CampaignParticipantSoftDeleteCommand } from '@/application/commands/campaign-participant-soft-delete/campaign-participant-soft-delete.command';
import { CampaignParticipantRoot } from '@/core/aggregate-roots';
import { CampaignParticipantNotFoundException } from '@/core/exceptions';
import { EOutputStatus, EOutputType } from '@/core/enums';

describe('CampaignParticipantSoftDeleteCommandHandler', () => {
  let handler: CampaignParticipantSoftDeleteCommandHandler;
  let mockParticipantRepository: any;

  beforeEach(() => {
    mockParticipantRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new CampaignParticipantSoftDeleteCommandHandler(mockParticipantRepository);
  });

  it('should throw CampaignParticipantNotFoundException if participant not found', async () => {
    mockParticipantRepository.findById.mockResolvedValue(null);

    const command = new CampaignParticipantSoftDeleteCommand('non-existent', 'user-123');
    await expect(handler.execute(command)).rejects.toThrow(CampaignParticipantNotFoundException);
  });

  it('should soft delete participant successfully when all outputs are in DRAFT or SCHEDULED', async () => {
    const participant = CampaignParticipantRoot.instantiate('participant-123', {
      campaignId: 'camp-1',
      kolProfileId: 'kol-1',
      status: EParticipantStatus.JOINED,
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      outputs: [
        {
          id: 'out-1',
          platformId: 'plat-1',
          outputType: EOutputType.VIDEO,
          title: 'Draft output',
          isScheduleForPost: true,
          fileId: null,
          scheduledAt: null,
          status: EOutputStatus.DRAFT,
          url: null,
          postedAt: null,
        },
      ],
      deleteAt: null,
      deleteBy: null,
    } as any);

    mockParticipantRepository.findById.mockResolvedValue(participant);

    const command = new CampaignParticipantSoftDeleteCommand('participant-123', 'admin-user');
    await handler.execute(command);

    expect(participant.deleteAt).toBeInstanceOf(Date);
    expect(participant.deleteBy).toBe('admin-user');
    expect(mockParticipantRepository.save).toHaveBeenCalledWith(participant);
  });

  it('should throw error when soft deleting participant with published outputs', async () => {
    const participant = CampaignParticipantRoot.instantiate('participant-123', {
      campaignId: 'camp-1',
      kolProfileId: 'kol-1',
      status: EParticipantStatus.JOINED,
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      outputs: [
        {
          id: 'out-1',
          platformId: 'plat-1',
          outputType: EOutputType.VIDEO,
          title: 'Published output',
          isScheduleForPost: false,
          fileId: null,
          scheduledAt: null,
          status: EOutputStatus.PUBLISHED,
          url: 'http://test.com',
          postedAt: new Date(),
        },
      ],
      deleteAt: null,
      deleteBy: null,
    } as any);

    mockParticipantRepository.findById.mockResolvedValue(participant);

    const command = new CampaignParticipantSoftDeleteCommand('participant-123', 'admin-user');
    await expect(handler.execute(command)).rejects.toThrow('Cannot delete participant with published outputs');
  });
});

import { EParticipantStatus } from '@/core/enums';
