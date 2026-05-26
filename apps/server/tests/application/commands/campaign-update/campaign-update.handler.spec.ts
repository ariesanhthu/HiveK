import { UpdateCampaignHandler } from '@/application/commands/campaign-update/campaign-update.handler';
import { CampaignUpdateCommand } from '@/application/commands/campaign-update/campaign-update.command';
import { NotFoundException } from '@nestjs/common';
import { CampaignRoot } from '@/core/aggregate-roots';
import { CampaignMapper } from '@/application/mappers';

describe('UpdateCampaignHandler', () => {
  let handler: UpdateCampaignHandler;
  let mockCampaignRepository: any;

  beforeEach(() => {
    mockCampaignRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new UpdateCampaignHandler(mockCampaignRepository);
  });

  it('should update a campaign successfully', async () => {
    const mockCampaign = {
      id: 'campaign-123',
      ownerId: 'owner-id',
      enterpriseId: 'enterprise-id',
      campaign: {
        name: 'Summer Sale',
        type: 'Discount',
        startDate: new Date('2026-06-01T00:00:00Z'),
        endDate: new Date('2026-06-30T00:00:00Z'),
        objective: 'Sales',
        description: 'Promo campaign',
      },
      targeting: {
        audience: {
          ageRange: '18-35',
          interests: ['fashion', 'electronics'],
        },
        locations: ['Vietnam'],
      },
      campaignItems: [],
      raw: [],
      update: jest.fn(),
    };

    mockCampaignRepository.findById.mockResolvedValue(mockCampaign);

    const input = {
      campaign: {
        name: 'Updated Summer Sale',
        type: 'Discount',
        startDate: '2026-06-01T00:00:00Z',
        endDate: '2026-06-30T00:00:00Z',
        objective: 'Updated Objective',
        description: 'Updated Description',
      },
    };

    const command = new CampaignUpdateCommand('campaign-123', input as any);
    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(mockCampaignRepository.findById).toHaveBeenCalledWith('campaign-123');
    expect(mockCampaign.update).toHaveBeenCalled();
    expect(mockCampaignRepository.save).toHaveBeenCalledWith(mockCampaign);
  });

  it('should throw NotFoundException if campaign not found', async () => {
    mockCampaignRepository.findById.mockResolvedValue(null);

    const command = new CampaignUpdateCommand('campaign-123', {});
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });
});
