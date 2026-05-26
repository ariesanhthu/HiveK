import { CampaignMapper } from '@/application/mappers/campaign.mapper';

describe('CampaignMapper', () => {
  it('should map CampaignRoot to CampaignDto', () => {
    const mockRoot = {
      id: 'campaign-123',
      ownerId: 'owner-123',
      enterpriseId: 'enterprise-123',
      campaign: {
        name: 'Summer Sale',
        type: 'Promo',
        startDate: new Date('2026-06-01T00:00:00Z'),
        endDate: new Date('2026-06-30T00:00:00Z'),
        objective: 'Objective',
        description: 'Description',
      },
      targeting: {
        audience: {
          ageRange: '18-35',
          interests: ['fashion'],
        },
        locations: ['Vietnam'],
      },
      campaignItems: [
        {
          product: {
            name: 'P1',
            category: 'C1',
            brand: 'B1',
            description: 'D1',
            features: ['F1'],
            keywords: ['K1'],
            priceSegment: 'low',
          },
          marketing: {
            angle: ['A1'],
            contentStyle: ['S1'],
            tone: ['T1'],
            keyMessages: ['M1'],
          },
          pricing: {
            originalPrice: 10,
            salePrice: 8,
            currency: 'USD',
          },
          promotion: {
            type: 'type',
            value: 2,
            unit: 'USD',
          },
          channels: [
            {
              type: 'social',
              platform: 'Facebook',
              url: 'https://fb.com',
            },
          ],
        },
      ],
      raw: [
        {
          fileId: 'file-1',
          rawText: 'text',
          inference: 'inf',
        },
      ],
    } as any;

    const dto = CampaignMapper.toDto(mockRoot);

    expect(dto).toBeDefined();
    expect(dto.id).toBe('campaign-123');
    expect(dto.campaign.startDate).toBe('2026-06-01T00:00:00.000Z');
  });

  it('should map list of roots to list of DTOs', () => {
    const mockRoot = {
      id: 'campaign-123',
      ownerId: 'owner-123',
      enterpriseId: 'enterprise-123',
      campaign: {
        name: 'Summer Sale',
        type: 'Promo',
        startDate: new Date('2026-06-01T00:00:00Z'),
        endDate: new Date('2026-06-30T00:00:00Z'),
        objective: 'Objective',
        description: 'Description',
      },
      targeting: {
        audience: {
          ageRange: '18-35',
          interests: ['fashion'],
        },
        locations: ['Vietnam'],
      },
      campaignItems: [],
      raw: [],
    } as any;

    const dtos = CampaignMapper.toListDto([mockRoot]);
    expect(dtos).toHaveLength(1);
    expect(dtos[0].id).toBe('campaign-123');
  });
});
