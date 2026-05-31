import { PlatformSoftDeleteCommandHandler } from '@/application/commands/platform-soft-delete/platform-soft-delete.handler';
import { PlatformSoftDeleteCommand } from '@/application/commands/platform-soft-delete/platform-soft-delete.command';
import { PlatformNotFoundException } from '@/core/exceptions';

describe('PlatformSoftDeleteCommandHandler', () => {
  let handler: PlatformSoftDeleteCommandHandler;
  let mockPlatformRepository: any;

  beforeEach(() => {
    mockPlatformRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new PlatformSoftDeleteCommandHandler(mockPlatformRepository);
  });

  it('should soft delete platform successfully', async () => {
    const mockPlatform = {
      softDelete: jest.fn(),
    };
    mockPlatformRepository.findById.mockResolvedValue(mockPlatform);

    const command = new PlatformSoftDeleteCommand('platform-123', 'admin');
    await handler.execute(command);

    expect(mockPlatformRepository.findById).toHaveBeenCalledWith('platform-123');
    expect(mockPlatform.softDelete).toHaveBeenCalledWith('admin');
    expect(mockPlatformRepository.save).toHaveBeenCalledWith(mockPlatform);
  });

  it('should throw NotFoundException if platform not found', async () => {
    mockPlatformRepository.findById.mockResolvedValue(null);

    const command = new PlatformSoftDeleteCommand('platform-123', 'admin');
    await expect(handler.execute(command)).rejects.toThrow(PlatformNotFoundException);
  });
});
