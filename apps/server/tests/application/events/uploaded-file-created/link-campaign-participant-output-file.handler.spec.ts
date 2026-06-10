import { LinkCampaignParticipantOutputFileHandler } from '@/application/events/uploaded-file-created/link-campaign-participant-output-file.handler';
import { UploadedFileCreatedEvent } from '@/application/events/uploaded-file-created/uploaded-file-created.event';
import { TargetType } from '@/core/enums';

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

  it('should set output file when target is CAMPAIGN_PARTICIPANT with fileId field', async () => {
    const participant = { setOutputFileId: jest.fn() };
    mockParticipantRepository.findByOutputId.mockResolvedValue(participant);

    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.CAMPAIGN_PARTICIPANT, 'cp-1', 'fileId'));

    expect(mockParticipantRepository.findByOutputId).toHaveBeenCalledWith('cp-1');
    expect(participant.setOutputFileId).toHaveBeenCalledWith('cp-1', 'file-1');
    expect(mockParticipantRepository.save).toHaveBeenCalledWith(participant);
  });

  it('should accept "file" field as well', async () => {
    const participant = { setOutputFileId: jest.fn() };
    mockParticipantRepository.findByOutputId.mockResolvedValue(participant);

    await handler.handle(new UploadedFileCreatedEvent('file-2', TargetType.CAMPAIGN_PARTICIPANT, 'cp-2', 'file'));

    expect(participant.setOutputFileId).toHaveBeenCalled();
  });

  it('should ignore non-matching target types', async () => {
    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.USER, 'user-1', 'fileId'));
    expect(mockParticipantRepository.findByOutputId).not.toHaveBeenCalled();
  });

  it('should ignore non-matching fields', async () => {
    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.CAMPAIGN_PARTICIPANT, 'cp-1', 'avatar'));
    expect(mockParticipantRepository.findByOutputId).not.toHaveBeenCalled();
  });

  it('should silently skip if participant not found', async () => {
    mockParticipantRepository.findByOutputId.mockResolvedValue(null);
    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.CAMPAIGN_PARTICIPANT, 'nonexistent', 'fileId'));
    expect(mockParticipantRepository.save).not.toHaveBeenCalled();
  });
});