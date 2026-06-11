import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MongoEnterpriseRepository } from '@/infrastructure/mongo/repositories/enterprise.repository';
import { EnterpriseModel } from '@/infrastructure/mongo/schemas/enterprise.schema';
import { EnterpriseRoot } from '@/core/aggregate-roots';
import { Types } from 'mongoose';
import { UNIT_OF_WORK } from '@/application/interfaces';

describe('MongoEnterpriseRepository', () => {
  let repository: MongoEnterpriseRepository;
  let mockEnterpriseModel: any;
  let mockUow: any;

  const validId = new Types.ObjectId().toHexString();
  const validUserId = new Types.ObjectId().toHexString();

  const mockEnterpriseDoc = {
    _id: new Types.ObjectId(),
    user_id: new Types.ObjectId(validUserId),
    company_name: 'Test Enterprise',
    description: 'Desc',
    contact_email: 'test@ent.com',
    contact_phone: '+841234567890',
    is_verified: false,
    created_at: new Date(),
    updated_at: new Date(),
    delete_at: null,
    delete_by: null,
  };

  beforeEach(async () => {
    // Model should be a constructor and have static methods
    mockEnterpriseModel = jest.fn().mockImplementation((data) => ({
        ...data,
        save: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
    }));
    
    mockEnterpriseModel.findById = jest.fn().mockReturnThis();
    mockEnterpriseModel.findOne = jest.fn().mockReturnThis();
    mockEnterpriseModel.findByIdAndUpdate = jest.fn().mockReturnThis();
    mockEnterpriseModel.findByIdAndDelete = jest.fn().mockReturnThis();
    mockEnterpriseModel.session = jest.fn().mockReturnThis();
    mockEnterpriseModel.exec = jest.fn();

    mockUow = {
        getSession: jest.fn().mockReturnValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MongoEnterpriseRepository,
        {
          provide: getModelToken(EnterpriseModel.name),
          useValue: mockEnterpriseModel,
        },
        {
          provide: UNIT_OF_WORK,
          useValue: mockUow,
        },
      ],
    }).compile();

    repository = module.get<MongoEnterpriseRepository>(MongoEnterpriseRepository);
  });

  it('findById returns enterprise when found', async () => {
    mockEnterpriseModel.exec.mockResolvedValue(mockEnterpriseDoc);

    const result = await repository.findById(validId);

    expect(result).toBeInstanceOf(EnterpriseRoot);
    expect(result?.companyName).toBe(mockEnterpriseDoc.company_name);
  });

  it('findByUserId returns enterprise when found', async () => {
    mockEnterpriseModel.exec.mockResolvedValue(mockEnterpriseDoc);

    const result = await repository.findByUserId(validUserId);

    expect(result).toBeInstanceOf(EnterpriseRoot);
  });

  it('save inserts new enterprise', async () => {
    const enterprise = EnterpriseRoot.create({
      userId: validUserId,
      companyName: 'New Ent',
      description: 'Desc',
      contactEmail: 'new@ent.com',
    });

    await repository.save(enterprise);

    expect(enterprise.id).toBeDefined();
    expect(mockEnterpriseModel).toHaveBeenCalled();
  });
});
