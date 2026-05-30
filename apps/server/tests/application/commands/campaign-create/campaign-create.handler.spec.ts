import { CreateCampaignHandler } from '@/application/commands/campaign-create/campaign-create.handler';
import { CampaignCreateCommand } from '@/application/commands/campaign-create/campaign-create.command';

describe('CreateCampaignHandler', () => {
  let handler: CreateCampaignHandler;
  let mockCampaignRepository: any;

  beforeEach(() => {
    mockCampaignRepository = {
      save: jest.fn(),
    };
    handler = new CreateCampaignHandler(mockCampaignRepository);
  });

  it('should create a campaign successfully', async () => {
    const input = {
      ownerId: 'owner-id',
      enterpriseId: 'enterprise-id',
      campaign: {
        name: 'Summer Sale',
        type: 'Discount',
        startDate: '2026-06-01T00:00:00Z',
        endDate: '2026-06-30T00:00:00Z',
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
      campaignItems: [
        {
          product: {
            name: 'T-Shirt',
            category: 'Apparel',
            brand: 'BrandX',
            description: 'Cotton t-shirt',
            features: ['breathable'],
            keywords: ['shirt'],
            priceSegment: 'low',
          },
          marketing: {
            angle: ['youthful'],
            contentStyle: ['video'],
            tone: ['energetic'],
            keyMessages: ['Buy 1 Get 1'],
          },
          pricing: {
            originalPrice: 100,
            salePrice: 80,
            currency: 'USD',
          },
          promotion: {
            type: 'percentage',
            value: 20,
            unit: '%',
          },
          channels: [
            {
              type: 'social',
               platform: 'Facebook',
              url: 'https://facebook.com',
            },
          ],
        },
      ],
    };

    const command = new CampaignCreateCommand(input as any);
    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(mockCampaignRepository.save).toHaveBeenCalled();
    expect(result.ownerId).toBe('owner-id');
    expect(result.enterpriseId).toBe('enterprise-id');
  });
});
