import { CampaignRoot, CampaignProps } from '@core/aggregate-roots/campaign.aggregate';

describe('CampaignRoot Aggregate Root', () => {
  const props: CampaignProps = {
    ownerId: 'owner-1',
    enterpriseId: 'enterprise-1',
    campaign: {
      name: 'Summer Sale',
      type: 'promotion',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-30'),
      objective: 'Boost sales',
      description: 'Big discounts',
    },
    targeting: {
      audience: {
        ageRange: '18-35',
        interests: ['sports', 'tech'],
      },
      locations: ['Vietnam'],
    },
    campaignItems: [
      {
        product: {
          name: 'Shirt',
          category: 'Clothing',
          brand: 'BrandX',
          description: 'Cool shirt',
          features: ['cotton'],
          keywords: ['cool'],
          priceSegment: 'mid',
        },
        marketing: {
          angle: ['Casual style'],
          contentStyle: ['video'],
          tone: ['friendly'],
          keyMessages: ['Be cool'],
        },
        pricing: {
          originalPrice: 200,
          salePrice: 150,
          currency: 'USD',
        },
        promotion: {
          type: 'discount',
          value: 25,
          unit: 'percent',
        },
        channels: [
          {
            type: 'ecommerce',
            platform: 'Shopee',
            url: 'https://shopee.vn/shirt',
          },
        ],
      },
    ],
    raw: [
      {
        fileId: 'file-123',
        rawText: 'Original details text',
        inference: 'AI summary',
      },
    ],
  };

  it('should create and get properties correctly', () => {
    const root = CampaignRoot.create(props);

    expect(root).toBeDefined();
    expect(root.ownerId).toBe(props.ownerId);
    expect(root.enterpriseId).toBe(props.enterpriseId);
    expect(root.campaign.name).toBe('Summer Sale');
    expect(root.campaignItems[0].product.name).toBe('Shirt');
    expect(root.raw[0].fileId).toBe('file-123');
  });

  it('should instantiate and update correctly', () => {
    const root = CampaignRoot.instantiate('campaign-123', props);
    expect(root.id).toBe('campaign-123');

    root.update({
      campaign: {
        name: 'Winter Sale',
        type: 'seasonal',
        startDate: new Date('2026-12-01'),
        endDate: new Date('2026-12-31'),
        objective: 'Clear stock',
        description: 'Winter clearance',
      },
    });

    expect(root.campaign.name).toBe('Winter Sale');
    expect(root.campaign.type).toBe('seasonal');
  });
});
