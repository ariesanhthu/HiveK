import { PlatformSoftDeleteCommand } from '@/application/commands/platform-soft-delete/platform-soft-delete.command';
import { PlatformSoftDeleteCommandHandler } from '@/application/commands/platform-soft-delete/platform-soft-delete.handler';
import { InvalidOperationException, PlatformNotFoundException } from '@/core/exceptions';

describe('PlatformSoftDeleteCommandHandler', () => {
  let handler: PlatformSoftDeleteCommandHandler;
  let mockPlatformRepository: any;
  let mockKolProfileRepository: any;
  let mockUow: any;

  beforeEach(() => {
    mockPlatformRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockKolProfileRepository = {
      existsByPlatformId: jest.fn(),
    };
    mockUow = {
      execute: jest.fn((fn: any) => fn()),
    };
    handler = new PlatformSoftDeleteCommandHandler(
      mockPlatformRepository,
      mockKolProfileRepository,
      mockUow,
    );
  });

  it('should soft delete platform successfully', async () => {
    const mockPlatform = {
      softDelete: jest.fn(),
    };
    mockPlatformRepository.findById.mockResolvedValue(mockPlatform);
    mockKolProfileRepository.existsByPlatformId.mockResolvedValue(false);

    const command = new PlatformSoftDeleteCommand('platform-123', 'admin');
    await handler.execute(command);

    expect(mockPlatformRepository.findById).toHaveBeenCalledWith('platform-123');
    expect(mockPlatform.softDelete).toHaveBeenCalledWith('admin');
    expect(mockPlatformRepository.save).toHaveBeenCalledWith(mockPlatform);
  });

  it('should throw InvalidOperationException if KOL profiles exist', async () => {
    mockPlatformRepository.findById.mockResolvedValue({ id: 'platform-123' });
    mockKolProfileRepository.existsByPlatformId.mockResolvedValue(true);

    const command = new PlatformSoftDeleteCommand('platform-123', 'admin');
    await expect(handler.execute(command)).rejects.toThrow(InvalidOperationException);
  });

  it('should throw NotFoundException if platform not found', async () => {
    mockPlatformRepository.findById.mockResolvedValue(null);

    const command = new PlatformSoftDeleteCommand('platform-123', 'admin');
    await expect(handler.execute(command)).rejects.toThrow(PlatformNotFoundException);
  });
});
