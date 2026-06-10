import { LinkUserAvatarHandler } from '@/application/events/uploaded-file-created/link-user-avatar.handler';
import { UploadedFileCreatedEvent } from '@/application/events/uploaded-file-created/uploaded-file-created.event';
import { TargetType } from '@/core/enums';

describe('LinkUserAvatarHandler', () => {
  let handler: LinkUserAvatarHandler;
  let mockUserRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new LinkUserAvatarHandler(mockUserRepository);
  });

  it('should update user avatar when target is USER with avatar field', async () => {
    const user = { id: 'user-1', props: { avatar: null, updatedAt: new Date('2026-01-01') } };
    mockUserRepository.findById.mockResolvedValue(user);

    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.USER, 'user-1', 'avatar'));

    expect(mockUserRepository.findById).toHaveBeenCalledWith('user-1');
    expect(user.props.avatar).toBe('file-1');
    expect(mockUserRepository.save).toHaveBeenCalledWith(user);
  });

  it('should accept avatarUrl field as well', async () => {
    const user = { id: 'user-1', props: { avatar: null, updatedAt: new Date('2026-01-01') } };
    mockUserRepository.findById.mockResolvedValue(user);

    await handler.handle(new UploadedFileCreatedEvent('file-2', TargetType.USER, 'user-1', 'avatarUrl'));

    expect(user.props.avatar).toBe('file-2');
  });

  it('should ignore non-USER target types', async () => {
    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.PLATFORM, 'plat-1', 'avatar'));
    expect(mockUserRepository.findById).not.toHaveBeenCalled();
  });

  it('should ignore non-matching fields', async () => {
    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.USER, 'user-1', 'logo'));
    expect(mockUserRepository.findById).not.toHaveBeenCalled();
  });

  it('should silently skip if user not found', async () => {
    mockUserRepository.findById.mockResolvedValue(null);
    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.USER, 'nonexistent', 'avatar'));
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });
});