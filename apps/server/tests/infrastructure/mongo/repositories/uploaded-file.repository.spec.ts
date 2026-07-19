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
import { MongoUploadedFileRepository } from '@/infrastructure/mongo/repositories/uploaded-file.repository';
import { UploadedFileRoot } from '@/core/aggregate-roots';
import { ETargetType } from '@/core/enums';

describe('MongoUploadedFileRepository', () => {
  let repo: MongoUploadedFileRepository;
  let mockModel: any;
  let mockUow: any;

  const fileDoc = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439015'),
    url: 'http://example.com/file.png',
    public_id: 'public-1',
    size: 1024,
    format: 'png',
    title: 'test-file',
    target_type: ETargetType.USER,
    target_id: 'user-1',
    target_field: 'avatar',
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

    repo = new MongoUploadedFileRepository(mockModel as any, mockUow);
  });

  describe('findById', () => {
    it('should return UploadedFileRoot when document is found', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(fileDoc);

      const result = await repo.findById('507f1f77bcf86cd799439015');

      expect(mockModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439015');
      expect(result).toBeInstanceOf(UploadedFileRoot);
      expect(result?.id).toBe('507f1f77bcf86cd799439015');
      expect(result?.url).toBe('http://example.com/file.png');
    });
  });

  describe('findByTarget', () => {
    it('should return array of UploadedFileRoots when found by target', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce([fileDoc]);

      const result = await repo.findByTarget('user-1', ETargetType.USER);

      expect(mockModel.find).toHaveBeenCalledWith({
        target_id: 'user-1',
        target_type: ETargetType.USER,
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('507f1f77bcf86cd799439015');
    });
  });

  describe('save', () => {
    it('should create new file document when id is undefined', async () => {
      const file = UploadedFileRoot.create({
        url: 'http://test.com/img.jpg',
        publicId: 'pub-id',
        size: 500,
        format: 'jpg',
        targetType: ETargetType.PLATFORM,
        targetId: 'plat-1',
        targetField: 'icon',
      });

      const saveMock = jest.fn().mockResolvedValue({ _id: new Types.ObjectId('507f1f77bcf86cd799439016') });
      mockModel.mockImplementation(() => ({ save: saveMock }));

      await repo.save(file);

      expect(saveMock).toHaveBeenCalled();
      expect(file.id).toBe('507f1f77bcf86cd799439016');
    });

    it('should update existing file document when id is present', async () => {
      const file = UploadedFileRoot.instantiate('507f1f77bcf86cd799439015', {
        url: 'http://updated.com/img.jpg',
        publicId: 'public-1',
        size: 1024,
        format: 'png',
        title: 'updated',
        targetType: ETargetType.USER,
        targetId: 'user-1',
        targetField: 'avatar',
        deleteAt: null,
        deleteBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (mockModel.exec as jest.Mock).mockResolvedValueOnce(undefined);

      await repo.save(file);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439015',
        expect.objectContaining({
          url: 'http://updated.com/img.jpg',
        }),
        { upsert: true }
      );
    });
  });
});
