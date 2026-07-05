import { Types } from 'mongoose';
import { MongoPlatformRepository } from '@/infrastructure/mongo/repositories/platform.repository';
import { PlatformRoot } from '@/core/aggregate-roots';
import { PlatformApiStatus } from '@/core/enums/platform-api-status.enum';

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

describe('MongoPlatformRepository', () => {
  let repo: MongoPlatformRepository;
  let mockModel: any;
  let mockUow: any;

  const platformDoc = {
    _id: new Types.ObjectId('plat-123'),
    name: 'youtube',
    base_url: 'https://youtube.com',
    api_status: PlatformApiStatus.STABLE,
    icon: 'icon-id',
    delete_at: null,
    delete_by: null,
    created_at: new Date(),
    updated_at: new Date(),
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

    repo = new MongoPlatformRepository(mockModel as any, mockUow);
  });

  describe('findById', () => {
    it('should return PlatformRoot when document is found', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(platformDoc);

      const result = await repo.findById('plat-123');

      expect(mockModel.findById).toHaveBeenCalledWith('plat-123');
      expect(result).toBeInstanceOf(PlatformRoot);
      expect(result?.id).toBe('plat-123');
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

      const saveMock = jest.fn().mockResolvedValue({ _id: new Types.ObjectId('generated-plat-id') });
      mockModel.mockImplementation(() => ({ save: saveMock }));

      await repo.save(platform);

      expect(saveMock).toHaveBeenCalled();
      expect(platform.id).toBe('generated-plat-id');
    });

    it('should update existing platform document when id is present', async () => {
      const platform = PlatformRoot.instantiate('plat-123', {
        name: 'youtube',
        baseUrl: 'https://youtube.com',
        apiStatus: PlatformApiStatus.MAINTENANCE,
        icon: 'icon-id',
        deleteAt: null,
        deleteBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (mockModel.exec as jest.Mock).mockResolvedValueOnce(undefined);

      await repo.save(platform);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'plat-123',
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
      await repo.delete('plat-123');
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('plat-123');
    });
  });
});
