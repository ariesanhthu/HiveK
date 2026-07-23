import { PlatformRestoreCommand } from '@/application/commands/platform-restore/platform-restore.command';
import { PlatformRestoreCommandHandler } from '@/application/commands/platform-restore/platform-restore.handler';
import { PlatformNotFoundException } from '@/core/exceptions';

describe('PlatformRestoreCommandHandler', () => {
  let handler: PlatformRestoreCommandHandler;
  let mockPlatformRepository: any;

  beforeEach(() => {
    mockPlatformRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new PlatformRestoreCommandHandler(mockPlatformRepository);
  });

  it('should restore platform successfully', async () => {
    const mockPlatform = {
      restore: jest.fn(),
    };
    mockPlatformRepository.findById.mockResolvedValue(mockPlatform);

    const command = new PlatformRestoreCommand('platform-123');
    await handler.execute(command);

    expect(mockPlatformRepository.findById).toHaveBeenCalledWith('platform-123');
    expect(mockPlatform.restore).toHaveBeenCalled();
    expect(mockPlatformRepository.save).toHaveBeenCalledWith(mockPlatform);
  });

  it('should throw NotFoundException if platform not found', async () => {
    mockPlatformRepository.findById.mockResolvedValue(null);

    const command = new PlatformRestoreCommand('platform-123');
    await expect(handler.execute(command)).rejects.toThrow(PlatformNotFoundException);
  });
});
