import { ProjectionDto } from '@/application/dtos/projection.dto';
import { KolProfileGetByIdQuery } from '@/application/queries';
import { KolProfileResolver } from '@/presentation/controllers/resolvers/kol-profile.resolver';
import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import type { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';

jest.mock('graphql-fields');

describe('KolProfileResolver', () => {
  let resolver: KolProfileResolver;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    const mockQueryBus = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KolProfileResolver,
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
      ],
    }).compile();

    resolver = module.get<KolProfileResolver>(KolProfileResolver);
    queryBus = module.get(QueryBus);
  });

  it('should construct correct query and projection and dispatch to QueryBus', async () => {
    const mockProfile = { id: 'kol-123', name: 'Test KOL' };
    queryBus.execute.mockResolvedValue(mockProfile);

    // Mock graphql fields map
    const mockFields = {
      id: {},
      name: {},
      user: {}, // relation field to trigger population
      scores: {},
      nonModelField: {}, // should be filtered out
    };

    (graphqlFields as jest.Mock).mockReturnValue(mockFields);
    const mockInfo = {} as GraphQLResolveInfo;

    const result = await resolver.getKolProfile('kol-123', mockInfo);

    expect(result).toBe(mockProfile);
    expect(queryBus.execute).toHaveBeenCalledTimes(1);

    const executedQuery = queryBus.execute.mock.calls[0][0] as KolProfileGetByIdQuery;
    expect(executedQuery).toBeInstanceOf(KolProfileGetByIdQuery);
    expect(executedQuery.id).toBe('kol-123');
    expect(executedQuery.projection).toBeInstanceOf(ProjectionDto);
    expect(executedQuery.projection.fields).toEqual(mockFields);
  });

  describe('getKolProfiles', () => {
    it('should construct correct list query and projection and dispatch to QueryBus', async () => {
      const mockResult = { data: [], cursor: null };
      queryBus.execute.mockResolvedValue(mockResult);

      const mockFields = {
        data: {
          id: {},
          name: {},
        },
      };
      (graphqlFields as jest.Mock).mockReturnValue(mockFields);
      const mockInfo = {} as GraphQLResolveInfo;
      const filters = { limit: 10, cursor: 'cursor-1' } as any;

      const result = await resolver.getKolProfiles(filters, mockInfo);

      expect(result).toEqual(mockResult);
      expect(queryBus.execute).toHaveBeenCalledTimes(1);
    });
  });
});
