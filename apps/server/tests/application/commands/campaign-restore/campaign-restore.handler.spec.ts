import { CampaignRestoreCommandHandler } from '@/application/commands/campaign-restore/campaign-restore.handler';
import { CampaignRestoreCommand } from '@/application/commands/campaign-restore/campaign-restore.command';
import { CampaignNotFoundException } from '@/core/exceptions';

describe('CampaignRestoreCommandHandler', () => {
  let handler: CampaignRestoreCommandHandler;
  let mockCampaignRepository: any;

  beforeEach(() => {
    mockCampaignRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new CampaignRestoreCommandHandler(mockCampaignRepository);
  });

  it('should restore campaign successfully', async () => {
    const mockCampaign = {
      id: 'campaign-123',
      restore: jest.fn(),
    };
    mockCampaignRepository.findById.mockResolvedValue(mockCampaign);
    const command = new CampaignRestoreCommand('campaign-123');

    await handler.execute(command);

    expect(mockCampaignRepository.findById).toHaveBeenCalledWith('campaign-123');
    expect(mockCampaign.restore).toHaveBeenCalled();
    expect(mockCampaignRepository.save).toHaveBeenCalledWith(mockCampaign);
  });

  it('should throw NotFoundException if campaign to restore not found', async () => {
    mockCampaignRepository.findById.mockResolvedValue(null);
    const command = new CampaignRestoreCommand('campaign-123');

    await expect(handler.execute(command)).rejects.toThrow(CampaignNotFoundException);
    expect(mockCampaignRepository.save).not.toHaveBeenCalled();
  });
});
