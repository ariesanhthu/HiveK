import { KolProfileGetListHandler } from '@/application/queries/kol-profile-get-list/kol-profile-get-list.handler';
import { KolProfileGetListQuery } from '@/application/queries/kol-profile-get-list/kol-profile-get-list.query';

describe('KolProfileGetListHandler', () => {
  let handler: KolProfileGetListHandler;
  let mockKolProfileReadService: any;

  beforeEach(() => {
    mockKolProfileReadService = {
      findAll: jest.fn(),
    };
    handler = new KolProfileGetListHandler(mockKolProfileReadService);
  });

  it('should get KOL profiles successfully', async () => {
    const mockResponse = {
      data: [],
      meta: {
        hasNextPage: false,
        nextCursor: null,
      },
    };
    mockKolProfileReadService.findAll.mockResolvedValue(mockResponse);

    const query = new KolProfileGetListQuery({ limit: 10, sort: 'desc' } as any);
    const result = await handler.execute(query);

    expect(result).toEqual(mockResponse);
    expect(mockKolProfileReadService.findAll).toHaveBeenCalledWith({ limit: 10, sort: 'desc' });
  });
});
