import { LinkCampaignParticipantOutputFileHandler } from '@/application/events/uploaded-file-created/link-campaign-participant-output-file.handler';
import { UploadedFileCreatedEvent } from '@/application/events/uploaded-file-created/uploaded-file-created.event';
import { TargetType } from '@/core/enums';

describe('LinkCampaignParticipantOutputFileHandler', () => {
  let handler: LinkCampaignParticipantOutputFileHandler;
  let mockCampaignRepository: any;

  beforeEach(() => {
    mockCampaignRepository = {
      findByOutputId: jest.fn(),
      save: jest.fn(),
    };
    handler = new LinkCampaignParticipantOutputFileHandler(mockCampaignRepository);
  });

  it('should ignore non-matching target types', async () => {
    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.USER, 'user-1', 'fileId'));
    expect(mockCampaignRepository.findByOutputId).not.toHaveBeenCalled();
  });

  it('should ignore non-matching fields', async () => {
    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.CAMPAIGN_PARTICIPANT, 'cp-1', 'avatar'));
    expect(mockCampaignRepository.findByOutputId).not.toHaveBeenCalled();
  });

  it('should silently skip if participant not found', async () => {
    mockCampaignRepository.findByOutputId.mockResolvedValue(null);
    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.CAMPAIGN_PARTICIPANT, 'nonexistent', 'fileId'));
    expect(mockCampaignRepository.save).not.toHaveBeenCalled();
  });
});
