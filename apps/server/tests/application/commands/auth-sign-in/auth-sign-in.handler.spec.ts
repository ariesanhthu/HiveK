import { AuthSignInCommandHandler } from '@/application/commands/auth-sign-in/auth-sign-in.handler';
import { AuthSignInCommand } from '@/application/commands/auth-sign-in/auth-sign-in.command';
import { ERoleType } from '@/core/enums';
import { InvalidCredentialsException } from '@/core/exceptions';
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
      mockAuthService as any,
    );
  });

  const createMockUser = (overrides = {}) => ({
    id: 'user-123',
    email: 'user@example.com',
    passwordHash: 'hashed-password',
    roleId: 'role-123',
    type: ERoleType.KOL,
    updateRefreshToken: jest.fn(),
    ...overrides,
  });

  describe('Happy Paths', () => {
    it('should sign in successfully with valid credentials for a regular user', async () => {
      const input = { email: 'user@example.com', password: 'password123' };
      const command = new AuthSignInCommand(input);
      const mockUser = createMockUser();

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);
      mockAuthService.comparePassword!.mockResolvedValue(true);
      mockAuthService.generateTokens!.mockResolvedValue({
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
      expect(mockAuthService.comparePassword).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(mockAuthService.generateTokens).toHaveBeenCalledWith({
        sub: 'user-123',
        email: 'user@example.com',
        role: 'role-123',
        type: ERoleType.KOL,
      });
      expect(mockUser.updateRefreshToken).toHaveBeenCalledWith('refresh-token');
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should sign in successfully for an admin user when isAdmin is true', async () => {
      const input = { email: 'admin@example.com', password: 'password123' };
      const command = new AuthSignInCommand(input, true);
      const mockAdmin = createMockUser({ type: ERoleType.ADMIN });

      mockUserRepository.findByEmail.mockResolvedValue(mockAdmin as any);
      mockAuthService.comparePassword!.mockResolvedValue(true);
      mockAuthService.generateTokens!.mockResolvedValue({
        accessToken: 'adm-access',
        refreshToken: 'adm-refresh',
      });

      const result = await handler.execute(command);

      expect(result.accessToken).toBe('adm-access');
      expect(mockUserRepository.save).toHaveBeenCalled();
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
      const mockUser = createMockUser();

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);
      mockAuthService.comparePassword!.mockResolvedValue(false);

      await expect(handler.execute(command)).rejects.toThrow(InvalidCredentialsException);
    });

    it('should throw InvalidCredentialsException if regular user tries to sign in as admin', async () => {
      const input = { email: 'user@example.com', password: 'password123' };
      const command = new AuthSignInCommand(input, true); // isAdmin = true
      const mockUser = createMockUser({ type: ERoleType.KOL });

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);

      await expect(handler.execute(command)).rejects.toThrow(InvalidCredentialsException);
    });

    it('should normalize email before lookup', async () => {
       const input = { email: '  USER@example.com  ', password: 'password123' };
       const command = new AuthSignInCommand(input);
       const mockUser = createMockUser({ email: 'user@example.com' });

       mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);
       mockAuthService.comparePassword!.mockResolvedValue(true);
       mockAuthService.generateTokens!.mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });

       await handler.execute(command);

       expect(mockAuthService.normalizeEmail).toHaveBeenCalledWith('  USER@example.com  ');
       expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
    });
  });
});
