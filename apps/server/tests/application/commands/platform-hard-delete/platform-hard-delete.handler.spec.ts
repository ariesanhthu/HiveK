import { PlatformHardDeleteCommandHandler } from '@/application/commands/platform-hard-delete/platform-hard-delete.handler';
import { PlatformHardDeleteCommand } from '@/application/commands/platform-hard-delete/platform-hard-delete.command';
import { PlatformNotFoundException } from '@/core/exceptions';

describe('PlatformHardDeleteCommandHandler', () => {
  let handler: PlatformHardDeleteCommandHandler;
  let mockPlatformRepository: any;

  beforeEach(() => {
    mockPlatformRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };
    handler = new PlatformHardDeleteCommandHandler(mockPlatformRepository);
  });

  it('should hard delete platform successfully', async () => {
    const mockPlatform = {};
    mockPlatformRepository.findById.mockResolvedValue(mockPlatform);

    const command = new PlatformHardDeleteCommand('platform-123');
    await handler.execute(command);

    expect(mockPlatformRepository.findById).toHaveBeenCalledWith('platform-123');
    expect(mockPlatformRepository.delete).toHaveBeenCalledWith('platform-123');
  });

  it('should throw NotFoundException if platform not found', async () => {
    mockPlatformRepository.findById.mockResolvedValue(null);

    const command = new PlatformHardDeleteCommand('platform-123');
    await expect(handler.execute(command)).rejects.toThrow(PlatformNotFoundException);
  });
});
