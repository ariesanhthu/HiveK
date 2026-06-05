import { LinkCampaignRawHandler } from '@/application/events/uploaded-file-created/link-campaign-raw.handler';
import { UploadedFileCreatedEvent } from '@/application/events/uploaded-file-created/uploaded-file-created.event';
import { TargetType } from '@/core/enums';

describe('LinkCampaignRawHandler', () => {
  let handler: LinkCampaignRawHandler;
  let mockCampaignRepository: any;

  beforeEach(() => {
    mockCampaignRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new LinkCampaignRawHandler(mockCampaignRepository);
  });

  it('should append raw to campaign when target is CAMPAIGN with raw field', async () => {
    const campaign = { id: 'cmp-1', raw: [{ fileId: 'old-file', rawText: '', inference: '' }], update: jest.fn() };
    mockCampaignRepository.findById.mockResolvedValue(campaign);

    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.CAMPAIGN, 'cmp-1', 'raw'));

    expect(campaign.update).toHaveBeenCalledWith({
      raw: [
        { fileId: 'old-file', rawText: '', inference: '' },
        { fileId: 'file-1', rawText: '', inference: '' },
      ],
    });
    expect(mockCampaignRepository.save).toHaveBeenCalledWith(campaign);
  });

  it('should handle empty raw array', async () => {
    const campaign = { id: 'cmp-2', raw: [], update: jest.fn() };
    mockCampaignRepository.findById.mockResolvedValue(campaign);

    await handler.handle(new UploadedFileCreatedEvent('file-2', TargetType.CAMPAIGN, 'cmp-2', 'raw'));

    expect(campaign.update).toHaveBeenCalledWith({
      raw: [{ fileId: 'file-2', rawText: '', inference: '' }],
    });
  });

  it('should ignore non-CAMPAIGN target types', async () => {
    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.USER, 'user-1', 'raw'));
    expect(mockCampaignRepository.findById).not.toHaveBeenCalled();
  });

  it('should ignore non-raw fields', async () => {
    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.CAMPAIGN, 'cmp-1', 'avatar'));
    expect(mockCampaignRepository.findById).not.toHaveBeenCalled();
  });

  it('should silently skip if campaign not found', async () => {
    mockCampaignRepository.findById.mockResolvedValue(null);
    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.CAMPAIGN, 'nonexistent', 'raw'));
    expect(mockCampaignRepository.save).not.toHaveBeenCalled();
  });
});