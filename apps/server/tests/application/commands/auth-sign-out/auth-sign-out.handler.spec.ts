import { AuthSignOutCommandHandler } from '@/application/commands/auth-sign-out/auth-sign-out.handler';
import { AuthSignOutCommand } from '@/application/commands/auth-sign-out/auth-sign-out.command';
import { UserNotFoundException } from '@/core/exceptions';

describe('AuthSignOutCommandHandler', () => {
  let handler: AuthSignOutCommandHandler;
  let mockUserRepository: any;
  let mockWebSocketService: any;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockWebSocketService = {
      disconnectUser: jest.fn(),
    };
    handler = new AuthSignOutCommandHandler(mockUserRepository, mockWebSocketService);
  });

  it('should sign out successfully', async () => {
    const command = new AuthSignOutCommand('user-123');
    const mockUser = {
      id: 'user-123',
      updateRefreshToken: jest.fn(),
    } as any;

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockWebSocketService.disconnectUser.mockResolvedValue(undefined);

    const result = await handler.execute(command);
    expect(result).toEqual({ success: true });
    expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
    expect(mockUser.updateRefreshToken).toHaveBeenCalledWith(null);
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    expect(mockWebSocketService.disconnectUser).toHaveBeenCalledWith('user-123');
  });

  it('should throw error if user is not found', async () => {
    const command = new AuthSignOutCommand('user-123');
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
    expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
    expect(mockUserRepository.save).not.toHaveBeenCalled();
    expect(mockWebSocketService.disconnectUser).not.toHaveBeenCalled();
  });
});
