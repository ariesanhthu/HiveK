import { AuthSignInCommandHandler } from '@/application/commands/auth-sign-in/auth-sign-in.handler';
import { AuthSignInCommand } from '@/application/commands/auth-sign-in/auth-sign-in.command';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthSignInCommandHandler', () => {
  let handler: AuthSignInCommandHandler;
  let mockUserRepository: any;
  let mockJwtService: any;
  let mockConfigService: any;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
    mockJwtService = {
      sign: jest.fn(),
    };
    mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        if (key === 'JWT_ACCESS_EXPIRATION_MINUTES') return 30;
        if (key === 'JWT_REFRESH_EXPIRATION_MINUTES') return 10080;
        return defaultValue;
      }),
    };
    handler = new AuthSignInCommandHandler(mockUserRepository, mockJwtService, mockConfigService);
  });

  it('should sign in successfully with valid credentials', async () => {
    const command = new AuthSignInCommand({ email: 'user@example.com', password: 'password123' });
    const mockUser = {
      id: 'user-123',
      email: 'user@example.com',
      passwordHash: 'hashed',
      roleId: 'role-1',
      updateRefreshToken: jest.fn(),
    } as any;

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockJwtService.sign
      .mockReturnValueOnce('accessTokenString')
      .mockReturnValueOnce('refreshTokenString');

    const result = await handler.execute(command);

    expect(result).toEqual({ accessToken: 'accessTokenString', refreshToken: 'refreshTokenString' });
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed');
    expect(mockUser.updateRefreshToken).toHaveBeenCalledWith('refreshTokenString');
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    expect(mockJwtService.sign).toHaveBeenNthCalledWith(1, {
      sub: 'user-123',
      email: 'user@example.com',
      role: 'role-1',
    }, { expiresInMinutes: 30 });
    expect(mockJwtService.sign).toHaveBeenNthCalledWith(2, {
      sub: 'user-123',
      email: 'user@example.com',
      role: 'role-1',
    }, { expiresInMinutes: 10080 });
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
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(handler.execute(command)).rejects.toThrow('Invalid credentials');
  });
});
