import { Model, Types } from 'mongoose';
import { MongoCampaignRepository } from '@/infrastructure/mongo/repositories/campaign.repository';
import { CampaignRoot } from '@/core/aggregate-roots';

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    Types: {
      ObjectId: jest.fn().mockImplementation((id: string) => ({
        toString: () => id,
      })),
    },
  };
});

describe('MongoCampaignRepository', () => {
  let repo: MongoCampaignRepository;
  let mockModel: any;

  const campaignDoc = {
    _id: new Types.ObjectId('camp-123'),
    owner_id: new Types.ObjectId('owner-123'),
    enterprise_id: new Types.ObjectId('ent-123'),
    campaign: {
      name: 'Summer Promo',
      type: 'seasonal',
      start_date: new Date('2026-06-01T00:00:00Z'),
      end_date: new Date('2026-06-30T00:00:00Z'),
      objective: 'Objective',
      description: 'Desc',
    },
    targeting: {
      audience: {
        age_range: '18-35',
        interests: ['fashion'],
      },
      locations: ['VN'],
    },
    campaign_items: [
      {
        product: {
          name: 'Shirt',
          category: 'Apparel',
          brand: 'BrandA',
          description: 'Cotton',
          features: ['cool'],
          keywords: ['shirt'],
          price_segment: 'mid',
        },
        marketing: {
          angle: ['youthful'],
          content_style: ['video'],
          tone: ['energetic'],
          key_messages: ['Buy'],
        },
        pricing: {
          original_price: 100,
          sale_price: 90,
          currency: 'USD',
        },
        promotion: {
          type: 'discount',
          value: 10,
          unit: 'percent',
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
    raw: [],
    delete_at: null,
    delete_by: null,
  } as any;

  beforeEach(() => {
    mockModel = jest.fn();
    mockModel.findById = jest.fn().mockReturnThis();
    mockModel.findByIdAndUpdate = jest.fn().mockReturnThis();
    mockModel.findByIdAndDelete = jest.fn().mockReturnThis();
    mockModel.exec = jest.fn();

    repo = new MongoCampaignRepository(mockModel as any);
  });

  describe('findById', () => {
    it('should return CampaignRoot when document is found', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(campaignDoc);

      const result = await repo.findById('camp-123');

      expect(mockModel.findById).toHaveBeenCalledWith('camp-123');
      expect(result).toBeInstanceOf(CampaignRoot);
      expect(result?.id).toBe('camp-123');
      expect(result?.campaign.name).toBe('Summer Promo');
      expect(result?.campaignItems[0].product.brand).toBe('BrandA');
    });

    it('should return null when document is not found', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(null);

      const result = await repo.findById('camp-456');

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should create new campaign document when id is undefined', async () => {
      const campaign = CampaignRoot.create({
        ownerId: 'owner-123',
        enterpriseId: 'ent-123',
        campaign: {
          name: 'Summer Promo',
          type: 'seasonal',
          startDate: new Date('2026-06-01T00:00:00Z'),
          endDate: new Date('2026-06-30T00:00:00Z'),
          objective: 'Objective',
          description: 'Desc',
        },
        targeting: {
          audience: {
            ageRange: '18-35',
            interests: ['fashion'],
          },
          locations: ['VN'],
        },
        campaignItems: [],
        raw: [],
      });

      const saveMock = jest.fn().mockResolvedValue({ _id: new Types.ObjectId('generated-camp-id') });
      mockModel.mockImplementation(() => ({ save: saveMock }));

      await repo.save(campaign);

      expect(saveMock).toHaveBeenCalled();
      expect(campaign.id).toBe('generated-camp-id');
    });

    it('should update existing campaign document when id is present', async () => {
      const campaign = CampaignRoot.instantiate('camp-123', {
        ownerId: 'owner-123',
        enterpriseId: 'ent-123',
        campaign: {
          name: 'Summer Promo Updated',
          type: 'seasonal',
          startDate: new Date('2026-06-01T00:00:00Z'),
          endDate: new Date('2026-06-30T00:00:00Z'),
          objective: 'Objective',
          description: 'Desc',
        },
        targeting: {
          audience: {
            ageRange: '18-35',
            interests: ['fashion'],
          },
          locations: ['VN'],
        },
        campaignItems: [],
        raw: [],
        deleteAt: null,
        deleteBy: null,
      });

      (mockModel.exec as jest.Mock).mockResolvedValueOnce(undefined);

      await repo.save(campaign);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'camp-123',
        expect.objectContaining({
          campaign: expect.objectContaining({ name: 'Summer Promo Updated' }),
        }),
        { upsert: true }
      );
    });
  });

  describe('delete', () => {
    it('should call findByIdAndDelete with the correct id', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(undefined);

      await repo.delete('camp-123');

      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('camp-123');
    });
  });
});
