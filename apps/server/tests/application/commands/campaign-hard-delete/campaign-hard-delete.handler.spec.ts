import { CampaignHardDeleteCommandHandler } from '@/application/commands/campaign-hard-delete/campaign-hard-delete.handler';
import { CampaignHardDeleteCommand } from '@/application/commands/campaign-hard-delete/campaign-hard-delete.command';
import { NotFoundException } from '@nestjs/common';

describe('CampaignHardDeleteCommandHandler', () => {
  let handler: CampaignHardDeleteCommandHandler;
  let mockCampaignRepository: any;

  beforeEach(() => {
    mockCampaignRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };
    handler = new CampaignHardDeleteCommandHandler(mockCampaignRepository);
  });

  it('should delete campaign successfully', async () => {
    mockCampaignRepository.findById.mockResolvedValue({ id: 'campaign-123' });
    const command = new CampaignHardDeleteCommand('campaign-123');

    await handler.execute(command);

    expect(mockCampaignRepository.findById).toHaveBeenCalledWith('campaign-123');
    expect(mockCampaignRepository.delete).toHaveBeenCalledWith('campaign-123');
  });

  it('should throw NotFoundException if campaign to delete not found', async () => {
    mockCampaignRepository.findById.mockResolvedValue(null);
    const command = new CampaignHardDeleteCommand('campaign-123');

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    expect(mockCampaignRepository.delete).not.toHaveBeenCalled();
  });
});
