import { UserUpdateProfileCommand } from '@/application/commands/user-update-profile/user-update-profile.command';
import { UserUpdateProfileCommandHandler } from '@/application/commands/user-update-profile/user-update-profile.handler';
import { UserNotFoundException } from '@/core/exceptions';

describe('UserUpdateProfileCommandHandler', () => {
  let handler: UserUpdateProfileCommandHandler;
  let mockUserRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new UserUpdateProfileCommandHandler(mockUserRepository);
  });

  it('should update user profile successfully', async () => {
    const mockUser = {
      id: 'user-123',
      props: {
        fullName: 'Old Name',
      },
    };
    mockUserRepository.findById.mockResolvedValue(mockUser);

    const command = new UserUpdateProfileCommand('user-123', {
      firstName: 'New',
      lastName: 'Name',
    } as any);

    const result = await handler.execute(command);

    expect(result).toEqual({ success: true });
    expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
    expect(mockUser.props.fullName).toBe('New Name');
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
  });

  it('should throw error if user not found', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    const command = new UserUpdateProfileCommand('user-123', {} as any);
    await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
  });
});
