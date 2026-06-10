import { PlatformHardDeleteCommandHandler } from '@/application/commands/platform-hard-delete/platform-hard-delete.handler';
import { PlatformHardDeleteCommand } from '@/application/commands/platform-hard-delete/platform-hard-delete.command';
import { PlatformNotFoundException, InvalidOperationException } from '@/core/exceptions';

describe('PlatformHardDeleteCommandHandler', () => {
  let handler: PlatformHardDeleteCommandHandler;
  let mockPlatformRepository: any;
  let mockKolProfileRepository: any;
  let mockUow: any;

  beforeEach(() => {
    mockPlatformRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };
    mockKolProfileRepository = {
        existsByPlatformId: jest.fn(),
    };
    mockUow = {
        execute: jest.fn((fn: any) => fn()),
    };
    handler = new PlatformHardDeleteCommandHandler(
        mockPlatformRepository, 
        mockKolProfileRepository, 
        mockUow
    );
  });

  it('should hard delete platform successfully', async () => {
    mockPlatformRepository.findById.mockResolvedValue({ id: 'platform-123' });
    mockKolProfileRepository.existsByPlatformId.mockResolvedValue(false);

    const command = new PlatformHardDeleteCommand('platform-123');
    await handler.execute(command);

    expect(mockPlatformRepository.findById).toHaveBeenCalledWith('platform-123');
    expect(mockPlatformRepository.delete).toHaveBeenCalledWith('platform-123');
  });

  it('should throw InvalidOperationException if KOL profiles exist', async () => {
    mockPlatformRepository.findById.mockResolvedValue({ id: 'platform-123' });
    mockKolProfileRepository.existsByPlatformId.mockResolvedValue(true);

    const command = new PlatformHardDeleteCommand('platform-123');
    await expect(handler.execute(command)).rejects.toThrow(InvalidOperationException);
  });

  it('should throw NotFoundException if platform not found', async () => {
    mockPlatformRepository.findById.mockResolvedValue(null);

    const command = new PlatformHardDeleteCommand('platform-123');
    await expect(handler.execute(command)).rejects.toThrow(PlatformNotFoundException);
  });
});
