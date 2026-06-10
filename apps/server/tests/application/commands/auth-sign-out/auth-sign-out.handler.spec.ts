import { AuthSignOutCommandHandler } from '@/application/commands/auth-sign-out/auth-sign-out.handler';
import { AuthSignOutCommand } from '@/application/commands/auth-sign-out/auth-sign-out.command';
import { UserNotFoundException } from '@/core/exceptions';
import { createMockUserRepository } from '../../../__mocks__/mock-repositories';
import { createMockWebSocketService } from '../../../__mocks__/mock-services';

describe('AuthSignOutCommandHandler', () => {
  let handler: AuthSignOutCommandHandler;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockWebSocketService: ReturnType<typeof createMockWebSocketService>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockWebSocketService = createMockWebSocketService();

    handler = new AuthSignOutCommandHandler(
      mockUserRepository,
      mockWebSocketService as any,
    );
  });

  const createMockUser = () => ({
    id: 'user-123',
    updateRefreshToken: jest.fn(),
  });

  describe('Happy Path', () => {
    it('should successfully sign out a user', async () => {
      const userId = 'user-123';
      const command = new AuthSignOutCommand(userId);
      const mockUser = createMockUser();

      mockUserRepository.findById.mockResolvedValue(mockUser as any);
      mockWebSocketService.disconnectUser.mockResolvedValue(undefined);

      const result = await handler.execute(command);

      expect(result).toEqual({ success: true });
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUser.updateRefreshToken).toHaveBeenCalledWith(null);
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(mockWebSocketService.disconnectUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('Sad Path', () => {
    it('should throw UserNotFoundException if user does not exist', async () => {
      const userId = 'nonexistent';
      const command = new AuthSignOutCommand(userId);

      mockUserRepository.findById.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(mockWebSocketService.disconnectUser).not.toHaveBeenCalled();
    });
  });
});
