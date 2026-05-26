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

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
    };
    mockJwtService = {
      sign: jest.fn(),
    };
    handler = new AuthSignInCommandHandler(mockUserRepository, mockJwtService);
  });

  it('should sign in successfully with valid credentials', async () => {
    const command = new AuthSignInCommand({ email: 'user@example.com', password: 'password123' });
    const mockUser = {
      id: 'user-123',
      email: 'user@example.com',
      passwordHash: 'hashed',
      roleId: 'role-1',
    } as any;

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockJwtService.sign.mockReturnValue('accessTokenString');

    const result = await handler.execute(command);

    expect(result).toEqual({ accessToken: 'accessTokenString' });
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed');
    expect(mockJwtService.sign).toHaveBeenCalledWith({
      sub: 'user-123',
      email: 'user@example.com',
      role: 'role-1',
    });
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
