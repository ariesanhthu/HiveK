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
import { MongoPlatformRepository } from '@/infrastructure/mongo/repositories/platform.repository';
import { PlatformRoot } from '@/core/aggregate-roots';
import { PlatformApiStatus } from '@/core/enums/platform-api-status.enum';

describe('MongoPlatformRepository', () => {
  let repo: MongoPlatformRepository;
  let mockModel: any;
  let mockUow: any;

  const platformDoc = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439013'),
    name: 'youtube',
    base_url: 'https://youtube.com',
    api_status: PlatformApiStatus.STABLE,
    icon: '507f1f77bcf86cd79943901c',
    delete_at: null,
    delete_by: null,
    created_at: new Date(),
    updated_at: new Date(),
  } as any;

  const mockCacheService = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
    delByPattern: jest.fn().mockResolvedValue(undefined),
  };

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

    repo = new MongoPlatformRepository(mockModel as any, mockUow, mockCacheService as any);
  });

  describe('findById', () => {
    it('should return PlatformRoot when document is found', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(platformDoc);

      const result = await repo.findById('507f1f77bcf86cd799439013');

      expect(mockModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439013');
      expect(result).toBeInstanceOf(PlatformRoot);
      expect(result?.id).toBe('507f1f77bcf86cd799439013');
      expect(result?.name).toBe('youtube');
    });
  });

  describe('save', () => {
    it('should create new platform document when id is undefined', async () => {
      const platform = PlatformRoot.create({
        name: 'Twitter',
        baseUrl: 'https://twitter.com',
        apiStatus: PlatformApiStatus.STABLE,
      });

      const saveMock = jest.fn().mockResolvedValue({ _id: new Types.ObjectId('507f1f77bcf86cd799439014') });
      mockModel.mockImplementation(() => ({ save: saveMock }));

      await repo.save(platform);

      expect(saveMock).toHaveBeenCalled();
      expect(platform.id).toBe('507f1f77bcf86cd799439014');
    });

    it('should update existing platform document when id is present', async () => {
      const platform = PlatformRoot.instantiate('507f1f77bcf86cd799439013', {
        name: 'youtube',
        baseUrl: 'https://youtube.com',
        apiStatus: PlatformApiStatus.MAINTENANCE,
        icon: '507f1f77bcf86cd79943901c',
        deleteAt: null,
        deleteBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (mockModel.exec as jest.Mock).mockResolvedValueOnce(undefined);

      await repo.save(platform);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439013',
        expect.objectContaining({
          api_status: PlatformApiStatus.MAINTENANCE,
        }),
        { upsert: true }
      );
    });
  });

  describe('delete', () => {
    it('should call findByIdAndDelete with correct id', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(undefined);
      await repo.delete('507f1f77bcf86cd799439013');
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439013');
    });
  });
});
