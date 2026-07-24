import { AuthSignInCommand } from '@/application/commands/auth-sign-in/auth-sign-in.command';
import { AuthSignInCommandHandler } from '@/application/commands/auth-sign-in/auth-sign-in.handler';
import { KOLUserRoot } from '@/core/aggregate-roots/kol-user.aggregate';
import { ERoleType } from '@/core/enums';
import { InvalidCredentialsException } from '@/core/exceptions';
import { PhoneNumberVO } from '@/core/value-objects/phone-number.value-object';
import { jest } from '@jest/globals';
import { createMockUserRepository } from '../../../__mocks__/mock-repositories';
import { createMockAuthService } from '../../../__mocks__/mock-services';

describe('AuthSignInCommandHandler', () => {
  let handler: AuthSignInCommandHandler;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockAuthService = createMockAuthService();

    handler = new AuthSignInCommandHandler(
      mockUserRepository,
      mockAuthService,
    );
  });

  const createMockKOLUser = (id: string, email: string) => {
    return KOLUserRoot.instantiate(id, {
      email,
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
      refreshToken: null,
      googleId: null,
    });
  };

  describe('Happy Paths', () => {
    it('should sign in successfully with valid credentials for a regular user', async () => {
      const input = { email: 'user@example.com', password: 'password123' };
      const command = new AuthSignInCommand(input);
      const mockUser = createMockKOLUser('user-123', 'user@example.com');

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockAuthService.comparePassword.mockResolvedValue(true);
      mockAuthService.generateTokens.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const result = await handler.execute(command);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(mockAuthService.normalizeEmail).toHaveBeenCalledWith('user@example.com');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
      expect(mockAuthService.comparePassword).toHaveBeenCalledWith(
        'password123',
        'hashed-password',
      );
      expect(mockAuthService.generateTokens).toHaveBeenCalledWith({
        sub: 'user-123',
        email: 'user@example.com',
        role: 'role-123',
        type: ERoleType.KOL,
      });
      expect(mockUser.refreshToken).toBe('refresh-token');
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('Sad Paths', () => {
    it('should throw InvalidCredentialsException if user email is not found', async () => {
      const input = { email: 'wrong@example.com', password: 'password' };
      const command = new AuthSignInCommand(input);

      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(InvalidCredentialsException);
    });

    it('should throw InvalidCredentialsException if password does not match', async () => {
      const input = { email: 'user@example.com', password: 'wrong-password' };
      const command = new AuthSignInCommand(input);
      const mockUser = createMockKOLUser('user-123', 'user@example.com');

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockAuthService.comparePassword.mockResolvedValue(false);

      await expect(handler.execute(command)).rejects.toThrow(InvalidCredentialsException);
    });

    it('should throw InvalidCredentialsException if regular user tries to sign in as admin', async () => {
      const input = { email: 'user@example.com', password: 'password123' };
      const command = new AuthSignInCommand(input, true); // isAdmin = true
      const mockUser = createMockKOLUser('user-123', 'user@example.com');

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(handler.execute(command)).rejects.toThrow(InvalidCredentialsException);
    });
  });
});
