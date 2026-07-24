import { AuthSignOutCommand } from '@/application/commands/auth-sign-out/auth-sign-out.command';
import { AuthSignOutCommandHandler } from '@/application/commands/auth-sign-out/auth-sign-out.handler';
import { KOLUserRoot } from '@/core/aggregate-roots/kol-user.aggregate';
import { ERoleType } from '@/core/enums';
import { UserNotFoundException } from '@/core/exceptions';
import { PhoneNumberVO } from '@/core/value-objects/phone-number.value-object';
import { jest } from '@jest/globals';
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
      mockWebSocketService,
    );
  });

  const createMockKOLUser = (id: string) => {
    return KOLUserRoot.instantiate(id, {
      email: 'user@example.com',
      phone: PhoneNumberVO.create({ value: '+84987654321' }),
      passwordHash: 'hashed-password',
      type: ERoleType.KOL,
      roleId: 'role-123',
      isEmailVerified: true,
      fullName: 'KOL User',
      createdAt: new Date(),
      updatedAt: new Date(),
      deleteAt: null,
      deleteBy: null,
      refreshToken: 'some-token',
      googleId: null,
    });
  };

  describe('Happy Path', () => {
    it('should successfully sign out a user', async () => {
      const userId = 'user-123';
      const command = new AuthSignOutCommand(userId);
      const mockUser = createMockKOLUser(userId);

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockWebSocketService.disconnectUser.mockResolvedValue(undefined);

      const result = await handler.execute(command);

      expect(result).toEqual({ success: true });
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUser.refreshToken).toBeNull();
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
