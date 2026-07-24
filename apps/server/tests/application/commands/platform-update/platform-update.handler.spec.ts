import { PlatformUpdateCommand } from '@/application/commands/platform-update/platform-update.command';
import { PlatformUpdateCommandHandler } from '@/application/commands/platform-update/platform-update.handler';
import { PlatformNotFoundException, UploadedFileNotFoundException } from '@/core/exceptions';

describe('PlatformUpdateCommandHandler', () => {
  let handler: PlatformUpdateCommandHandler;
  let mockPlatformRepository: any;
  let mockUploadedFileRepository: any;

  beforeEach(() => {
    mockPlatformRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockUploadedFileRepository = {
      findById: jest.fn(),
    };
    handler = new PlatformUpdateCommandHandler(mockPlatformRepository, mockUploadedFileRepository);
  });

  it('should update platform successfully', async () => {
    const mockPlatform = {
      id: 'platform-123',
      props: {
        name: 'old',
      },
      updateIcon: jest.fn(),
      updateApiStatus: jest.fn(),
    };
    mockPlatformRepository.findById.mockResolvedValue(mockPlatform);
    mockUploadedFileRepository.findById.mockResolvedValue({});

    const input = { name: 'new', icon: 'file-123' };
    const command = new PlatformUpdateCommand('platform-123', input as any);
    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(mockPlatformRepository.findById).toHaveBeenCalledWith('platform-123');
    expect(mockUploadedFileRepository.findById).toHaveBeenCalledWith('file-123');
    expect(mockPlatformRepository.save).toHaveBeenCalled();
  });

  it('should throw NotFoundException if platform not found', async () => {
    mockPlatformRepository.findById.mockResolvedValue(null);

    const command = new PlatformUpdateCommand('platform-123', {});
    await expect(handler.execute(command)).rejects.toThrow(PlatformNotFoundException);
  });

  it('should throw NotFoundException if icon file not found', async () => {
    mockPlatformRepository.findById.mockResolvedValue({ id: 'p1', props: {} });
    mockUploadedFileRepository.findById.mockResolvedValue(null);

    const command = new PlatformUpdateCommand('p1', { icon: 'none' });
    await expect(handler.execute(command)).rejects.toThrow(UploadedFileNotFoundException);
  });
});
