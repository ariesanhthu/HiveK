import { PlatformGetByIdHandler } from '@/application/queries/platform-get-by-id/platform-get-by-id.handler';
import { PlatformGetByIdQuery } from '@/application/queries/platform-get-by-id/platform-get-by-id.query';
import { PlatformNotFoundException } from '@/core/exceptions';

describe('PlatformGetByIdHandler', () => {
  let handler: PlatformGetByIdHandler;
  let mockPlatformReadService: any;

  beforeEach(() => {
    mockPlatformReadService = {
      findById: jest.fn(),
    };
    handler = new PlatformGetByIdHandler(mockPlatformReadService);
  });

  it('should return platform when found', async () => {
    const mockPlatform = { id: 'platform-123', name: 'Facebook' };
    mockPlatformReadService.findById.mockResolvedValue(mockPlatform);

    const query = new PlatformGetByIdQuery('platform-123');
    const result = await handler.execute(query);

    expect(result).toEqual(mockPlatform);
    expect(mockPlatformReadService.findById).toHaveBeenCalledWith('platform-123');
  });

  it('should throw NotFoundException when platform not found', async () => {
    mockPlatformReadService.findById.mockResolvedValue(null);

    const query = new PlatformGetByIdQuery('platform-123');
    await expect(handler.execute(query)).rejects.toThrow(PlatformNotFoundException);
  });
});
