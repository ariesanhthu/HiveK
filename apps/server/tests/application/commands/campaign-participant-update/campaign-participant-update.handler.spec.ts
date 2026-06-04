import { CampaignParticipantUpdateCommandHandler } from '@/application/commands/campaign-participant-update/campaign-participant-update.handler';
import { CampaignParticipantUpdateCommand } from '@/application/commands/campaign-participant-update/campaign-participant-update.command';
import { CampaignParticipantRoot } from '@/core/aggregate-roots';
import { CampaignParticipantNotFoundException } from '@/core/exceptions';
import { EParticipantStatus, EOutputStatus, EOutputType } from '@/core/enums';

describe('CampaignParticipantUpdateCommandHandler', () => {
  let handler: CampaignParticipantUpdateCommandHandler;
  let mockParticipantRepository: any;

  beforeEach(() => {
    mockParticipantRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new CampaignParticipantUpdateCommandHandler(mockParticipantRepository);
  });

  it('should throw CampaignParticipantNotFoundException if participant not found', async () => {
    mockParticipantRepository.findById.mockResolvedValue(null);

    const command = new CampaignParticipantUpdateCommand('non-existent', { status: EParticipantStatus.JOINED });
    await expect(handler.execute(command)).rejects.toThrow(CampaignParticipantNotFoundException);
  });

  it('should transition status using join() if target status is JOINED and current is PENDING_APPROVAL', async () => {
    const participant = CampaignParticipantRoot.instantiate('participant-123', {
      campaignId: 'camp-1',
      kolProfileId: 'kol-1',
      status: EParticipantStatus.PENDING_APPROVAL,
      joinedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      outputs: [],
      deleteAt: null,
      deleteBy: null,
    });

    mockParticipantRepository.findById.mockResolvedValue(participant);

    const command = new CampaignParticipantUpdateCommand('participant-123', { status: EParticipantStatus.JOINED });
    await handler.execute(command);

    expect(participant.status).toBe(EParticipantStatus.JOINED);
    expect(participant.joinedAt).toBeInstanceOf(Date);
    expect(mockParticipantRepository.save).toHaveBeenCalledWith(participant);
  });

  it('should update outputs and preserve existing fileId', async () => {
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
          title: 'Initial Video',
          isScheduleForPost: true,
          fileId: 'existing-file-uuid',
          scheduledAt: null,
          status: EOutputStatus.DRAFT,
          url: null,
          postedAt: null,
        },
      ],
      deleteAt: null,
      deleteBy: null,
    });

    mockParticipantRepository.findById.mockResolvedValue(participant);

    const command = new CampaignParticipantUpdateCommand('participant-123', {
      outputs: [
        {
          id: 'out-1',
          outputType: EOutputType.VIDEO,
          title: 'Updated Video Title',
          isScheduleForPost: true,
          scheduledAt: null,
          url: null,
        },
      ],
    });

    await handler.execute(command);

    expect(participant.outputs.length).toBe(1);
    expect(participant.outputs[0].title).toBe('Updated Video Title');
    expect(participant.outputs[0].fileId).toBe('existing-file-uuid'); // fileId preserved!
    expect(mockParticipantRepository.save).toHaveBeenCalledWith(participant);
  });

  it('should throw error when updating outputs if any output is in PUBLISHED state', async () => {
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
          title: 'Published Video',
          isScheduleForPost: false,
          fileId: null,
          scheduledAt: null,
          status: EOutputStatus.PUBLISHED,
          url: 'http://youtube.com/vid',
          postedAt: new Date(),
        },
      ],
      deleteAt: null,
      deleteBy: null,
    });

    mockParticipantRepository.findById.mockResolvedValue(participant);

    const command = new CampaignParticipantUpdateCommand('participant-123', {
      outputs: [
        {
          id: 'out-1',
          outputType: EOutputType.VIDEO,
          title: 'Attempted Update Title',
          isScheduleForPost: false,
          url: 'http://youtube.com/different-url',
        },
      ],
    });

    await expect(handler.execute(command)).rejects.toThrow('Cannot modify published output');
  });
});
