import { UpdatePlatformHandler } from '@/application/commands/platform-update/platform-update.handler';
import { PlatformUpdateCommand } from '@/application/commands/platform-update/platform-update.command';
import { NotFoundException } from '@nestjs/common';

describe('UpdatePlatformHandler', () => {
  let handler: UpdatePlatformHandler;
  let mockPlatformRepository: any;

  beforeEach(() => {
    mockPlatformRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new UpdatePlatformHandler(mockPlatformRepository);
  });

  it('should update platform successfully', async () => {
    const mockPlatform = {
      id: 'platform-123',
      props: {
        name: 'facebook',
        baseUrl: 'https://facebook.com',
      },
      updateIconUrl: jest.fn(),
      updateApiStatus: jest.fn(),
    };
    mockPlatformRepository.findById.mockResolvedValue(mockPlatform);

    const input = {
      name: 'Facebook2',
      baseUrl: 'https://fb2.com',
      iconUrl: 'new-icon',
      apiStatus: 'inactive',
    };
    const command = new PlatformUpdateCommand('platform-123', input as any);

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(mockPlatformRepository.findById).toHaveBeenCalledWith('platform-123');
    expect(mockPlatform.updateIconUrl).toHaveBeenCalledWith('new-icon');
    expect(mockPlatform.updateApiStatus).toHaveBeenCalledWith('inactive');
    expect(mockPlatformRepository.save).toHaveBeenCalledWith(mockPlatform);
  });

  it('should throw NotFoundException if platform not found', async () => {
    mockPlatformRepository.findById.mockResolvedValue(null);

    const command = new PlatformUpdateCommand('platform-123', {});
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });
});
