import { AuthGoogleSignInCommandHandler } from '@/application/commands/auth-google-sign-in/auth-google-sign-in.handler';
import { AuthGoogleSignInCommand } from '@/application/commands/auth-google-sign-in/auth-google-sign-in.command';
import { ERoleType } from '@/core/enums';
import { UserDeletedException, RoleNotFoundException } from '@/core/exceptions';
import { createMockUserRepository, createMockRoleRepository } from '../../../__mocks__/mock-repositories';
import { createMockAuthService } from '../../../__mocks__/mock-services';
import { KOLUserRoot } from '@/core/aggregate-roots';

describe('AuthGoogleSignInCommandHandler', () => {
  let handler: AuthGoogleSignInCommandHandler;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockRoleRepository: ReturnType<typeof createMockRoleRepository>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockRoleRepository = createMockRoleRepository();
    mockAuthService = createMockAuthService();

    handler = new AuthGoogleSignInCommandHandler(
      mockUserRepository,
      mockRoleRepository,
      mockAuthService as any,
    );
  });

  const createMockUser = (overrides = {}) => ({
    id: 'user-123',
    email: 'user@example.com',
    googleId: null as string | null,
    deleteAt: null as Date | null,
    roleId: 'role-kol',
    type: ERoleType.KOL,
    updateGoogleId: jest.fn(),
    updateRefreshToken: jest.fn(),
    ...overrides,
  });

  describe('Happy Paths', () => {
    it('should sign in successfully for an existing user without googleId and link it', async () => {
      const input = { email: 'user@example.com', googleId: 'google-123', displayName: 'John' };
      const command = new AuthGoogleSignInCommand(input);
      const mockUser = createMockUser();

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);
      mockAuthService.generateTokens!.mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });

      const result = await handler.execute(command);

      expect(result).toEqual({ accessToken: 'at', refreshToken: 'rt' });
      expect(mockUser.updateGoogleId).toHaveBeenCalledWith('google-123');
      expect(mockUser.updateRefreshToken).toHaveBeenCalledWith('rt');
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should sign in successfully for an existing user who already has googleId linked', async () => {
      const input = { email: 'user@example.com', googleId: 'google-123' };
      const command = new AuthGoogleSignInCommand(input);
      const mockUser = createMockUser({ googleId: 'google-123' });

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);
      mockAuthService.generateTokens!.mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });

      await handler.execute(command);

      expect(mockUser.updateGoogleId).not.toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should create a new KOL user if email is not found', async () => {
      const input = { email: 'new@example.com', googleId: 'google-456', displayName: 'New User' };
      const command = new AuthGoogleSignInCommand(input);

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleRepository.findByTitle.mockResolvedValue({ id: 'role-kol' } as any);
      mockAuthService.generateTokens!.mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });

      const result = await handler.execute(command);

      expect(result.accessToken).toBe('at');
      expect(mockRoleRepository.findByTitle).toHaveBeenCalledWith(ERoleType.KOL);
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(KOLUserRoot));
      
      const savedUser = mockUserRepository.save.mock.calls[0][0] as KOLUserRoot;
      expect(savedUser.email).toBe('new@example.com');
      expect(savedUser.googleId).toBe('google-456');
      expect(savedUser.fullName).toBe('New User');
    });

    it('should use default display name for new user if not provided', async () => {
      const input = { email: 'noname@example.com', googleId: 'google-789' };
      const command = new AuthGoogleSignInCommand(input);

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleRepository.findByTitle.mockResolvedValue({ id: 'role-kol' } as any);

      await handler.execute(command);

      const savedUser = mockUserRepository.save.mock.calls[0][0] as KOLUserRoot;
      expect(savedUser.fullName).toBe('Google User');
    });
  });

  describe('Sad Paths', () => {
    it('should throw UserDeletedException if existing user is soft-deleted', async () => {
      const input = { email: 'deleted@example.com', googleId: 'g1' };
      const command = new AuthGoogleSignInCommand(input);
      const mockUser = createMockUser({ deleteAt: new Date() });

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);

      await expect(handler.execute(command)).rejects.toThrow(UserDeletedException);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw RoleNotFoundException if KOL role does not exist when creating new user', async () => {
      const input = { email: 'new@example.com', googleId: 'g1' };
      const command = new AuthGoogleSignInCommand(input);

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleRepository.findByTitle.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(RoleNotFoundException);
    });

    it('should normalize email before lookup', async () => {
      const input = { email: '  User@Example.Com  ', googleId: 'g1' };
      const command = new AuthGoogleSignInCommand(input);
      const mockUser = createMockUser({ email: 'user@example.com' });

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);

      await handler.execute(command);

      expect(mockAuthService.normalizeEmail).toHaveBeenCalledWith('  User@Example.Com  ');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
    });
  });
});
