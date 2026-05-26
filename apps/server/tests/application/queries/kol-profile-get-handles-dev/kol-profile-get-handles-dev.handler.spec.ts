import { KolProfileGetHandlesDevHandler } from '@/application/queries/kol-profile-get-handles-dev/kol-profile-get-handles-dev.handler';
import { KolProfileGetHandlesDevQuery } from '@/application/queries/kol-profile-get-handles-dev/kol-profile-get-handles-dev.query';

describe('KolProfileGetHandlesDevHandler', () => {
  let handler: KolProfileGetHandlesDevHandler;
  let mockKolProfileModel: any;
  let mockPlatformModel: any;

  beforeEach(() => {
    mockKolProfileModel = {
      find: jest.fn(),
    };
    mockPlatformModel = {
      find: jest.fn(),
    };
    handler = new KolProfileGetHandlesDevHandler(mockKolProfileModel, mockPlatformModel);
  });

  it('should retrieve and map kol handles successfully', async () => {
    const mockPlatforms = [
      { _id: 'plat-1', name: 'facebook' },
      { _id: 'plat-2', name: 'youtube' },
    ];
    mockPlatformModel.find.mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlatforms),
      }),
    });

    const mockDocs = [
      {
        _id: 'doc-1',
        platforms: [
          { platform_id: 'plat-1', uniqueId: 'john_fb' },
          { platform_id: 'plat-2', uniqueId: 'john_yt' },
        ],
      },
    ];

    const mockFindChain = {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockDocs),
    };
    mockKolProfileModel.find.mockReturnValue(mockFindChain);

    const query = new KolProfileGetHandlesDevQuery({ limit: 10, sort: 'desc' } as any);
    const result = await handler.execute(query);

    expect(result).toBeDefined();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].facebook).toBe('john_fb');
    expect(result.data[0].youtube).toBe('john_yt');
  });
});
