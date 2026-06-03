import { AuthRefreshTokenCommandHandler } from '@/application/commands/auth-refresh-token/auth-refresh-token.handler';
import { AuthRefreshTokenCommand } from '@/application/commands/auth-refresh-token/auth-refresh-token.command';
import { ERoleType } from '@/core/enums';

describe('AuthRefreshTokenCommandHandler', () => {
  let handler: AuthRefreshTokenCommandHandler;
  let mockUserRepository: any;
  let mockJwtService: any;
  let mockAuthService: any;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockJwtService = {
      verify: jest.fn(),
    };
    mockAuthService = {
      generateTokens: jest.fn(),
    };
    handler = new AuthRefreshTokenCommandHandler(mockUserRepository, mockJwtService, mockAuthService);
  });

  it('should refresh tokens successfully', async () => {
    const command = new AuthRefreshTokenCommand({ refreshToken: 'validRefreshToken' });
    const mockUser = {
      id: 'user-123',
      email: 'user@example.com',
      roleId: 'role-1',
      type: ERoleType.KOL,
      refreshToken: 'validRefreshToken',
      updateRefreshToken: jest.fn(),
    } as any;

    mockJwtService.verify.mockReturnValue({ sub: 'user-123' });
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockAuthService.generateTokens.mockResolvedValue({
      accessToken: 'newAccessTokenString',
      refreshToken: 'newRefreshTokenString',
    });

    const result = await handler.execute(command);

    expect(result).toEqual({
      accessToken: 'newAccessTokenString',
      refreshToken: 'newRefreshTokenString',
    });
    expect(mockJwtService.verify).toHaveBeenCalledWith('validRefreshToken');
    expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
    expect(mockAuthService.generateTokens).toHaveBeenCalledWith({
      sub: 'user-123',
      email: 'user@example.com',
      role: 'role-1',
      type: ERoleType.KOL,
    });
    expect(mockUser.updateRefreshToken).toHaveBeenCalledWith('newRefreshTokenString');
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
  });

  it('should throw error if token verification fails', async () => {
    const command = new AuthRefreshTokenCommand({ refreshToken: 'invalidRefreshToken' });
    mockJwtService.verify.mockImplementation(() => {
      throw new Error('Expired');
    });

    await expect(handler.execute(command)).rejects.toThrow('Invalid or expired refresh token');
  });

  it('should throw error if user is not found', async () => {
    const command = new AuthRefreshTokenCommand({ refreshToken: 'validRefreshToken' });
    mockJwtService.verify.mockReturnValue({ sub: 'user-123' });
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow('User not found');
  });

  it('should throw error if refresh token does not match persisted token', async () => {
    const command = new AuthRefreshTokenCommand({ refreshToken: 'differentRefreshToken' });
    const mockUser = {
      id: 'user-123',
      refreshToken: 'validRefreshToken',
    } as any;

    mockJwtService.verify.mockReturnValue({ sub: 'user-123' });
    mockUserRepository.findById.mockResolvedValue(mockUser);

    await expect(handler.execute(command)).rejects.toThrow('Invalid refresh token');
  });
});
