import { UNIT_OF_WORK } from '@/application/interfaces';
import { CampaignRoot } from '@/core/aggregate-roots';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';
import { MongoCampaignRepository } from '@/infrastructure/mongo/repositories/campaign.repository';
import { Model, Types } from 'mongoose';

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
  let mockUow: any;

  const campaignDoc = {
    _id: new Types.ObjectId('camp-123'),
    owner_id: new Types.ObjectId('owner-123'),
    enterprise_id: new Types.ObjectId('ent-123'),
    budget: 5000,
    financial_target: { sales: 10000 },
    description: 'Summer sale campaign',
    platform_target: [
      {
        platformId: 'instagram',
        minFollowers: 1000,
        maxFollowers: 5000,
        note: 'E2E target platform',
        others: { age: '18-25' },
      },
    ],
    status: ECampaignStatus.DRAFT,
    collaborator_ids: ['owner-123'],
    raw_contents: [
      {
        fileId: 'file-123',
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

      const result = await repo.findById('camp-123');

      expect(mockModel.findById).toHaveBeenCalledWith('camp-123');
      expect(result).toBeInstanceOf(CampaignRoot);
      expect(result?.id).toBe('camp-123');
      expect(result?.budget).toBe(5000);
      expect(result?.description).toBe('Summer sale campaign');
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
        budget: 5000,
        financialTarget: {},
        description: 'Summer sale campaign',
        platformTarget: [],
        rawContents: [],
      });

      const saveMock = jest.fn().mockResolvedValue({
        _id: new Types.ObjectId('generated-camp-id'),
      });
      mockModel.mockImplementation(() => ({ save: saveMock }));

      await repo.save(campaign);

      expect(saveMock).toHaveBeenCalled();
      expect(campaign.id).toBe('generated-camp-id');
    });

    it('should update existing campaign document when id is present', async () => {
      const campaign = CampaignRoot.instantiate('camp-123', {
        ownerId: 'owner-123',
        enterpriseId: 'ent-123',
        budget: 5000,
        financialTarget: {},
        description: 'Summer sale campaign Updated',
        platformTarget: [],
        status: ECampaignStatus.DRAFT,
        collaboratorIds: ['owner-123'],
        rawContents: [],
        deleteAt: null,
        deleteBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (mockModel.exec as jest.Mock).mockResolvedValueOnce(undefined);

      await repo.save(campaign);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'camp-123',
        expect.objectContaining({
          description: 'Summer sale campaign Updated',
        }),
        { upsert: true },
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
