import { Test, TestingModule } from '@nestjs/testing';
import { QueryBus } from '@nestjs/cqrs';
import { CampaignParticipantResolver } from '@/presentation/resolvers/campaign-participant.resolver';
import { CampaignParticipantGetByIdQuery, CampaignParticipantGetListQuery } from '@/application/queries';
import { ProjectionDto } from '@/application/dtos/projection.dto';

describe('CampaignParticipantResolver', () => {
  let resolver: CampaignParticipantResolver;
  let mockQueryBus: any;

  beforeEach(async () => {
    mockQueryBus = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignParticipantResolver,
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
      ],
    }).compile();

    resolver = module.get<CampaignParticipantResolver>(CampaignParticipantResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getCampaignParticipant', () => {
    it('should execute CampaignParticipantGetByIdQuery with correct arguments', async () => {
      const mockResult = { id: 'participant-1', campaignId: 'campaign-1' };
      mockQueryBus.execute.mockResolvedValue(mockResult);

      const mockInfo = { fieldNodes: [] } as any;
      const result = await resolver.getCampaignParticipant('participant-1', mockInfo);

      expect(result).toEqual(mockResult);
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(CampaignParticipantGetByIdQuery),
      );
    });
  });

  describe('getCampaignParticipants', () => {
    it('should execute CampaignParticipantGetListQuery with correct arguments', async () => {
      const mockResult = { data: [], cursor: null };
      mockQueryBus.execute.mockResolvedValue(mockResult);

      const mockInfo = { fieldNodes: [] } as any;
      const filters = { limit: 10, cursor: 'cursor-1' } as any;
      const result = await resolver.getCampaignParticipants(filters, mockInfo);

      expect(result).toEqual(mockResult);
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(CampaignParticipantGetListQuery),
      );
    });
  });
});
