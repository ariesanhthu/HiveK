import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MongoKpiLogRepository } from '@/infrastructure/mongo/repositories/kpi-log.repository';
import { KpiLogModel } from '@/infrastructure/mongo/schemas/kpi-log.schema';
import { KpiLogEntity } from '@/core/entities/kpi-log.entity';
import { Types } from 'mongoose';
import { UNIT_OF_WORK } from '@/application/interfaces';

describe('MongoKpiLogRepository', () => {
  let repository: MongoKpiLogRepository;
  let mockKpiLogModel: any;
  let mockUow: any;

  const validParticipantId = new Types.ObjectId().toHexString();
  const validOutputId = new Types.ObjectId().toHexString();

  const mockKpiLogDoc = {
    _id: new Types.ObjectId(),
    timestamp: new Date(),
    participantId: new Types.ObjectId(validParticipantId),
    outputId: new Types.ObjectId(validOutputId),
    metrics: {
      views: 100,
      likes: 10,
      comments: 5,
      shares: 1,
    },
    delete_at: null,
    delete_by: null,
  };

  beforeEach(async () => {
    mockKpiLogModel = jest.fn().mockImplementation((data) => ({
        ...data,
        save: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
    }));
    
    mockKpiLogModel.findById = jest.fn().mockReturnThis();
    mockKpiLogModel.findByIdAndUpdate = jest.fn().mockReturnThis();
    mockKpiLogModel.findByIdAndDelete = jest.fn().mockReturnThis();
    mockKpiLogModel.session = jest.fn().mockReturnThis();
    mockKpiLogModel.exec = jest.fn();

    mockUow = {
        getSession: jest.fn().mockReturnValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MongoKpiLogRepository,
        {
          provide: getModelToken(KpiLogModel.name),
          useValue: mockKpiLogModel,
        },
        {
          provide: UNIT_OF_WORK,
          useValue: mockUow,
        },
      ],
    }).compile();

    repository = module.get<MongoKpiLogRepository>(MongoKpiLogRepository);
  });

  it('findById returns kpi log when found', async () => {
    mockKpiLogModel.exec.mockResolvedValue(mockKpiLogDoc);

    const result = await repository.findById(new Types.ObjectId().toHexString());

    expect(result).toBeInstanceOf(KpiLogEntity);
    expect(result?.participantId).toBe(mockKpiLogDoc.participantId.toString());
  });

  it('save inserts new kpi log', async () => {
    const kpiLog = KpiLogEntity.create({
      participantId: validParticipantId,
      outputId: validOutputId,
      metrics: { views: 10, likes: 1, comments: 0, shares: 0 },
    });

    await repository.save(kpiLog);

    expect(kpiLog.id).toBeDefined();
    expect(mockKpiLogModel).toHaveBeenCalled();
  });
});
