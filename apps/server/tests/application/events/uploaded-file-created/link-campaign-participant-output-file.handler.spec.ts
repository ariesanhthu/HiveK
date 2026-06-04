import { LinkCampaignParticipantOutputFileHandler } from '@/application/events/uploaded-file-created/link-campaign-participant-output-file.handler';
import { UploadedFileCreatedEvent } from '@/application/events/uploaded-file-created/uploaded-file-created.event';
import { TargetType } from '@/core/enums/target-type.enum';
import { CampaignParticipantRoot } from '@/core/aggregate-roots';
import { EParticipantStatus, EOutputStatus, EOutputType } from '@/core/enums';

describe('LinkCampaignParticipantOutputFileHandler', () => {
  let handler: LinkCampaignParticipantOutputFileHandler;
  let mockParticipantRepository: any;

  beforeEach(() => {
    mockParticipantRepository = {
      findByOutputId: jest.fn(),
      save: jest.fn(),
    };
    handler = new LinkCampaignParticipantOutputFileHandler(mockParticipantRepository);
  });

  it('should ignore event if targetType is not CAMPAIGN_PARTICIPANT', async () => {
    const event = new UploadedFileCreatedEvent(
      'file-123',
      TargetType.CAMPAIGN,
      'campaign-123',
      'raw',
    );

    await handler.handle(event);

    expect(mockParticipantRepository.findByOutputId).not.toHaveBeenCalled();
    expect(mockParticipantRepository.save).not.toHaveBeenCalled();
  });

  it('should ignore event if targetField is not fileId or file', async () => {
    const event = new UploadedFileCreatedEvent(
      'file-123',
      TargetType.CAMPAIGN_PARTICIPANT,
      'output-123',
      'otherField',
    );

    await handler.handle(event);

    expect(mockParticipantRepository.findByOutputId).not.toHaveBeenCalled();
    expect(mockParticipantRepository.save).not.toHaveBeenCalled();
  });

  it('should link file successfully to output when participant is found', async () => {
    const participant = CampaignParticipantRoot.instantiate('participant-123', {
      campaignId: 'camp-1',
      kolProfileId: 'kol-1',
      status: EParticipantStatus.JOINED,
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      outputs: [
        {
          id: 'output-123',
          platformId: 'plat-1',
          outputType: EOutputType.VIDEO,
          title: 'Output Title',
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
    });

    mockParticipantRepository.findByOutputId.mockResolvedValue(participant);

    const event = new UploadedFileCreatedEvent(
      'file-123',
      TargetType.CAMPAIGN_PARTICIPANT,
      'output-123',
      'fileId',
    );

    await handler.handle(event);

    expect(mockParticipantRepository.findByOutputId).toHaveBeenCalledWith('output-123');
    expect(participant.outputs[0].fileId).toBe('file-123');
    expect(mockParticipantRepository.save).toHaveBeenCalledWith(participant);
  });
});
