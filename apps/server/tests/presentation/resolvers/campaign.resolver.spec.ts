import { Test, TestingModule } from '@nestjs/testing';
import { QueryBus } from '@nestjs/cqrs';
import { CampaignResolver } from '@/presentation/controllers/resolvers/campaign.resolver';
import { CampaignGetByIdQuery, CampaignGetListQuery } from '@/application/queries';
import { ProjectionDto } from '@/application/dtos/projection.dto';

describe('CampaignResolver', () => {
  let resolver: CampaignResolver;
  let mockQueryBus: any;

  beforeEach(async () => {
    mockQueryBus = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignResolver,
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
      ],
    }).compile();

    resolver = module.get<CampaignResolver>(CampaignResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getCampaign', () => {
    it('should execute CampaignGetByIdQuery with correct arguments', async () => {
      const mockResult = { id: 'campaign-1', description: 'Test Campaign' };
      mockQueryBus.execute.mockResolvedValue(mockResult);

      const mockInfo = { fieldNodes: [] } as any;
      const result = await resolver.getCampaign('campaign-1', mockInfo);

      expect(result).toEqual(mockResult);
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(CampaignGetByIdQuery),
      );
    });
  });

  describe('getCampaigns', () => {
    it('should execute CampaignGetListQuery with correct arguments', async () => {
      const mockResult = { data: [], cursor: null };
      mockQueryBus.execute.mockResolvedValue(mockResult);

      const mockInfo = { fieldNodes: [] } as any;
      const filters = { limit: 10, cursor: 'cursor-1' } as any;
      const result = await resolver.getCampaigns(filters, mockInfo);

      expect(result).toEqual(mockResult);
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(CampaignGetListQuery),
      );
    });
  });
});
