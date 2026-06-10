import { AuthSignInCommandHandler } from '@/application/commands/auth-sign-in/auth-sign-in.handler';
import { AuthSignInCommand } from '@/application/commands/auth-sign-in/auth-sign-in.command';
import { ERoleType } from '@/core/enums';

describe('AuthSignInCommandHandler', () => {
  let handler: AuthSignInCommandHandler;
  let mockUserRepository: any;
  let mockAuthService: any;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
    mockAuthService = {
      normalizeEmail: jest.fn((email: string) => email.trim().toLowerCase()),
      comparePassword: jest.fn(),
      generateTokens: jest.fn(),
    };
    handler = new AuthSignInCommandHandler(mockUserRepository, mockAuthService);
  });

  it('should sign in successfully with valid credentials', async () => {
    const command = new AuthSignInCommand({ email: 'user@example.com', password: 'password123' });
    const mockUser = {
      id: 'user-123',
      email: 'user@example.com',
      passwordHash: 'hashed',
      roleId: 'role-1',
      type: ERoleType.KOL,
      updateRefreshToken: jest.fn(),
    } as any;

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockAuthService.comparePassword.mockResolvedValue(true);
    mockAuthService.generateTokens.mockResolvedValue({
      accessToken: 'accessTokenString',
      refreshToken: 'refreshTokenString',
    });

    const result = await handler.execute(command);

    expect(result).toEqual({ accessToken: 'accessTokenString', refreshToken: 'refreshTokenString' });
    expect(mockAuthService.normalizeEmail).toHaveBeenCalledWith('user@example.com');
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(mockAuthService.comparePassword).toHaveBeenCalledWith('password123', 'hashed');
    expect(mockAuthService.generateTokens).toHaveBeenCalledWith({
      sub: 'user-123',
      email: 'user@example.com',
      role: 'role-1',
      type: ERoleType.KOL,
    });
    expect(mockUser.updateRefreshToken).toHaveBeenCalledWith('refreshTokenString');
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
  });

  it('should throw error if user email not found', async () => {
    const command = new AuthSignInCommand({ email: 'user@example.com', password: 'password123' });
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow('Invalid credentials');
  });

  it('should throw error if password is invalid', async () => {
    const command = new AuthSignInCommand({ email: 'user@example.com', password: 'password123' });
    const mockUser = {
      id: 'user-123',
      email: 'user@example.com',
      passwordHash: 'hashed',
      roleId: 'role-1',
    } as any;

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    mockAuthService.comparePassword.mockResolvedValue(false);

    await expect(handler.execute(command)).rejects.toThrow('Invalid credentials');
  });
});
