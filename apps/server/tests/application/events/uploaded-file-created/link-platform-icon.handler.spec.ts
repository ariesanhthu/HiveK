import { LinkPlatformIconHandler } from '@/application/events/uploaded-file-created/link-platform-icon.handler';
import { UploadedFileCreatedEvent } from '@/application/events/uploaded-file-created/uploaded-file-created.event';
import { TargetType } from '@/core/enums';

describe('LinkPlatformIconHandler', () => {
  let handler: LinkPlatformIconHandler;
  let mockPlatformRepository: any;

  beforeEach(() => {
    mockPlatformRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new LinkPlatformIconHandler(mockPlatformRepository);
  });

  it('should update platform icon when target is PLATFORM with icon field', async () => {
    const platform = { id: 'plat-1', updateIcon: jest.fn() };
    mockPlatformRepository.findById.mockResolvedValue(platform);

    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.PLATFORM, 'plat-1', 'icon'));

    expect(platform.updateIcon).toHaveBeenCalledWith('file-1');
    expect(mockPlatformRepository.save).toHaveBeenCalledWith(platform);
  });

  it('should accept iconUrl field as well', async () => {
    const platform = { id: 'plat-1', updateIcon: jest.fn() };
    mockPlatformRepository.findById.mockResolvedValue(platform);

    await handler.handle(new UploadedFileCreatedEvent('file-2', TargetType.PLATFORM, 'plat-1', 'iconUrl'));

    expect(platform.updateIcon).toHaveBeenCalledWith('file-2');
  });

  it('should ignore non-PLATFORM target types', async () => {
    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.USER, 'user-1', 'icon'));
    expect(mockPlatformRepository.findById).not.toHaveBeenCalled();
  });

  it('should ignore non-matching fields', async () => {
    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.PLATFORM, 'plat-1', 'avatar'));
    expect(mockPlatformRepository.findById).not.toHaveBeenCalled();
  });

  it('should silently skip if platform not found', async () => {
    mockPlatformRepository.findById.mockResolvedValue(null);
    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.PLATFORM, 'nonexistent', 'icon'));
    expect(mockPlatformRepository.save).not.toHaveBeenCalled();
  });
});