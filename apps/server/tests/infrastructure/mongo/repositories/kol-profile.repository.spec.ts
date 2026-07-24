import { UNIT_OF_WORK } from '@/application/interfaces';
import { KolProfileEntity } from '@/core/entities/kol-profile.entity';
import { MongoKolProfileRepository } from '@/infrastructure/mongo/repositories/kol-profile.repository';
import { KolProfileModel } from '@/infrastructure/mongo/schemas/kol-profile.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

describe('MongoKolProfileRepository', () => {
  let repository: MongoKolProfileRepository;
  let mockKolProfileModel: any;
  let mockUow: any;

  const validUserId = new Types.ObjectId().toHexString();

  const mockKolProfileDoc = {
    _id: new Types.ObjectId(),
    user_id: new Types.ObjectId(validUserId),
    name: 'Test KOL',
    email: 'kol@test.com',
    platforms: [
      {
        platform_id: 'platform-1',
        uniqueId: 'handle-1',
        external_id: 'ext-1',
        follower_count: 1000,
      },
    ],
    is_verified: true,
    scores: { total: 100 },
    delete_at: null,
    delete_by: null,
  };

  beforeEach(async () => {
    mockKolProfileModel = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
    }));

    mockKolProfileModel.findById = jest.fn().mockReturnThis();
    mockKolProfileModel.findOne = jest.fn().mockReturnThis();
    mockKolProfileModel.findByIdAndUpdate = jest.fn().mockReturnThis();
    mockKolProfileModel.findByIdAndDelete = jest.fn().mockReturnThis();
    mockKolProfileModel.session = jest.fn().mockReturnThis();
    mockKolProfileModel.exec = jest.fn();

    mockUow = {
      getSession: jest.fn().mockReturnValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MongoKolProfileRepository,
        {
          provide: getModelToken(KolProfileModel.name),
          useValue: mockKolProfileModel,
        },
        {
          provide: UNIT_OF_WORK,
          useValue: mockUow,
        },
      ],
    }).compile();

    repository = module.get<MongoKolProfileRepository>(MongoKolProfileRepository);
  });

  it('findById returns profile when found', async () => {
    mockKolProfileModel.exec.mockResolvedValue(mockKolProfileDoc);

    const result = await repository.findById(new Types.ObjectId().toHexString());

    expect(result).toBeInstanceOf(KolProfileEntity);
    expect(result?.name).toBe(mockKolProfileDoc.name);
  });

  it('save inserts new profile', async () => {
    const profile = KolProfileEntity.create({
      name: 'New KOL',
      email: 'new@kol.com',
      verificationType: 'MANUAL',
    });

    await repository.save(profile);

    expect(profile.id).toBeDefined();
    expect(mockKolProfileModel).toHaveBeenCalled();
  });
});
