import { AuthGoogleSignInCommandHandler } from '@/application/commands/auth-google-sign-in/auth-google-sign-in.handler';
import { AuthGoogleSignInCommand } from '@/application/commands/auth-google-sign-in/auth-google-sign-in.command';
import { ERoleType } from '@/core/enums';
import { UserDeletedException, RoleNotFoundException } from '@/core/exceptions';

describe('AuthGoogleSignInCommandHandler', () => {
  let handler: AuthGoogleSignInCommandHandler;
  let mockUserRepository: any;
  let mockRoleRepository: any;
  let mockAuthService: any;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
    mockRoleRepository = {
      findByTitle: jest.fn(),
    };
    mockAuthService = {
      normalizeEmail: jest.fn((email: string) => email.trim().toLowerCase()),
      generateTokens: jest.fn().mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
    };
    handler = new AuthGoogleSignInCommandHandler(
      mockUserRepository, mockRoleRepository, mockAuthService,
    );
  });

  it('should sign in existing user without googleId and link it', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'hashed',
      roleId: 'role-1',
      type: ERoleType.KOL,
      deleteAt: null,
      googleId: null,
      updateGoogleId: jest.fn(),
      updateRefreshToken: jest.fn(),
    };
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);

    const command = new AuthGoogleSignInCommand({
      googleId: 'google-123',
      email: 'user@example.com',
      displayName: 'John',
    });

    const result = await handler.execute(command);

    expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    expect(mockUser.updateGoogleId).toHaveBeenCalledWith('google-123');
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
  });

  it('should sign in existing user who already has googleId linked', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'hashed',
      roleId: 'role-1',
      type: ERoleType.KOL,
      deleteAt: null,
      googleId: 'existing-google-id',
      updateGoogleId: jest.fn(),
      updateRefreshToken: jest.fn(),
    };
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);

    const command = new AuthGoogleSignInCommand({
      googleId: 'existing-google-id',
      email: 'user@example.com',
    });

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(mockUser.updateGoogleId).not.toHaveBeenCalled();
    expect(mockUserRepository.save).toHaveBeenCalled();
  });

  it('should throw UserDeletedException if existing user is soft-deleted', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'user@example.com',
      deleteAt: new Date(),
      deleteBy: 'system',
      updateGoogleId: jest.fn(),
    };
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);

    const command = new AuthGoogleSignInCommand({
      googleId: 'google-123',
      email: 'user@example.com',
    });

    await expect(handler.execute(command)).rejects.toThrow(UserDeletedException);
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('should create new user when email not found and generate tokens', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockRoleRepository.findByTitle.mockResolvedValue({ id: 'kol-role-id' });

    const command = new AuthGoogleSignInCommand({
      googleId: 'google-456',
      email: 'newuser@example.com',
      displayName: 'New User',
      avatarUrl: 'https://example.com/avatar.jpg',
    });

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(mockRoleRepository.findByTitle).toHaveBeenCalledWith(ERoleType.KOL);
    expect(mockUserRepository.save).toHaveBeenCalled();
    const savedUser = mockUserRepository.save.mock.calls[0][0];
    expect(savedUser.email).toBe('newuser@example.com');
    expect(savedUser.googleId).toBe('google-456');
    expect(savedUser.isEmailVerified).toBe(true);
  });

  it('should create new user with defaults when display name missing', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockRoleRepository.findByTitle.mockResolvedValue({ id: 'kol-role-id' });

    const command = new AuthGoogleSignInCommand({
      googleId: 'google-789',
      email: 'noname@example.com',
    });

    await handler.execute(command);

    const savedUser = mockUserRepository.save.mock.calls[0][0];
    expect(savedUser.fullName).toBe('Google User');
    expect(savedUser.avatar).toBeNull();
  });

  it('should throw RoleNotFoundException when KOL role is missing', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockRoleRepository.findByTitle.mockResolvedValue(null);

    const command = new AuthGoogleSignInCommand({
      googleId: 'google-999',
      email: 'norole@example.com',
    });

    await expect(handler.execute(command)).rejects.toThrow(RoleNotFoundException);
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });
});