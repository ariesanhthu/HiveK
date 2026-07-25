// Enterprise schema loading triggers SchemaFactory.createForClass which breaks with mongoose mock
jest.mock('@/infrastructure/mongo/schemas/enterprise.schema', () => ({}));

// Keep real Types.ObjectId to avoid SchemaFactory.createForClass validation failures
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    Types: {
      ...actual.Types,
      ObjectId: actual.Types.ObjectId,
    },
  };
});

import { Types } from 'mongoose';
import { MongoCampaignRepository } from '@/infrastructure/mongo/repositories/campaign.repository';
import { CampaignRoot } from '@/core/aggregate-roots';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';
import { UNIT_OF_WORK } from '@/application/interfaces';

describe('MongoCampaignRepository', () => {
  let repo: MongoCampaignRepository;
  let mockModel: any;
  let mockUow: any;

  const campaignDoc = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439021'),
    owner_id: new Types.ObjectId('507f1f77bcf86cd799439023'),
    enterprise_id: new Types.ObjectId('507f1f77bcf86cd799439024'),
    budget: 5000,
    financial_target: { sales: 10000 },
    description: 'Summer sale campaign',
    platform_target: [
      {
        platformId: 'instagram',
        minFollowers: 1000,
        maxFollowers: 5000,
        note: 'E2E target platform',
        extras: { age: '18-25' },
      },
    ],
    status: ECampaignStatus.DRAFT,
    collaborator_ids: ['507f1f77bcf86cd799439023'],
    raw_contents: [
      {
        fileId: '507f1f77bcf86cd799439015',
        rawContent: 'Original details text',
      },
    ],
    delete_at: null,
    delete_by: null,
  } as any;

  beforeEach(() => {
    mockModel = jest.fn();
    mockModel.findById = jest.fn().mockReturnThis();
    mockModel.find = jest.fn().mockReturnThis();
    mockModel.findOne = jest.fn().mockReturnThis();
    mockModel.findByIdAndUpdate = jest.fn().mockReturnThis();
    mockModel.findByIdAndDelete = jest.fn().mockReturnThis();
    mockModel.session = jest.fn().mockReturnThis();
    mockModel.exec = jest.fn();

    mockUow = {
        getSession: jest.fn().mockReturnValue(null),
    };

    repo = new MongoCampaignRepository(mockModel as any, mockUow);
  });

  describe('findById', () => {
    it('should return CampaignRoot when document is found', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(campaignDoc);

      const result = await repo.findById('507f1f77bcf86cd799439021');

      expect(mockModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439021');
      expect(result).toBeInstanceOf(CampaignRoot);
      expect(result?.id).toBe('507f1f77bcf86cd799439021');
      expect(result?.budget).toBe(5000);
      expect(result?.description).toBe('Summer sale campaign');
    });

    it('should return null when document is not found', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(null);

      const result = await repo.findById('507f1f77bcf86cd799439021');

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should create new campaign document when id is undefined', async () => {
      const campaign = CampaignRoot.create({
        ownerId: '507f1f77bcf86cd799439023',
        enterpriseId: '507f1f77bcf86cd799439024',
        budget: 5000,
        financialTarget: {},
        description: 'Summer sale campaign',
        platformTarget: [],
        rawContents: [],
      });

      const saveMock = jest.fn().mockResolvedValue({ _id: new Types.ObjectId('507f1f77bcf86cd799439022') });
      mockModel.mockImplementation(() => ({ save: saveMock }));

      await repo.save(campaign);

      expect(saveMock).toHaveBeenCalled();
      expect(campaign.id).toBe('507f1f77bcf86cd799439022');
    });

    it('should update existing campaign document when id is present', async () => {
      const campaign = CampaignRoot.instantiate('507f1f77bcf86cd799439021', {
        ownerId: '507f1f77bcf86cd799439023',
        enterpriseId: '507f1f77bcf86cd799439024',
        budget: 5000,
        financialTarget: {},
        description: 'Summer sale campaign Updated',
        platformTarget: [],
        status: ECampaignStatus.DRAFT,
        collaboratorIds: ['507f1f77bcf86cd799439023'],
        rawContents: [],
        participants: [],
        deleteAt: null,
        deleteBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (mockModel.exec as jest.Mock).mockResolvedValueOnce(undefined);

      await repo.save(campaign);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439021',
        expect.objectContaining({
          description: 'Summer sale campaign Updated',
        }),
        { upsert: true }
      );
    });
  });

  describe('delete', () => {
    it('should call findByIdAndDelete with the correct id', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(undefined);

      await repo.delete('507f1f77bcf86cd799439021');

      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439021');
    });
  });
});
