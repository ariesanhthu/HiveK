import { CampaignParticipantHardDeleteCommand } from '@/application/commands/campaign-participant-hard-delete/campaign-participant-hard-delete.command';
import { CampaignParticipantHardDeleteCommandHandler } from '@/application/commands/campaign-participant-hard-delete/campaign-participant-hard-delete.handler';
import { CampaignParticipantRoot } from '@/core/aggregate-roots';
import { EOutputStatus, EOutputType, EParticipantStatus } from '@/core/enums';
import { CampaignParticipantNotFoundException, InvalidOperationException } from '@/core/exceptions';

describe('CampaignParticipantHardDeleteCommandHandler', () => {
  let handler: CampaignParticipantHardDeleteCommandHandler;
  let mockParticipantRepository: any;

  beforeEach(() => {
    mockParticipantRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };
    handler = new CampaignParticipantHardDeleteCommandHandler(mockParticipantRepository);
  });

  it('should throw CampaignParticipantNotFoundException if participant not found', async () => {
    mockParticipantRepository.findById.mockResolvedValue(null);

    const command = new CampaignParticipantHardDeleteCommand('non-existent');
    await expect(handler.execute(command)).rejects.toThrow(CampaignParticipantNotFoundException);
  });

  it('should hard delete participant successfully when there are no published outputs', async () => {
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

    const command = new CampaignParticipantHardDeleteCommand('participant-123');
    await handler.execute(command);

    expect(mockParticipantRepository.delete).toHaveBeenCalledWith('participant-123');
  });

  it('should throw InvalidOperationException when hard deleting participant with published outputs', async () => {
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

    const command = new CampaignParticipantHardDeleteCommand('participant-123');
    await expect(handler.execute(command)).rejects.toThrow(InvalidOperationException);
  });
});
