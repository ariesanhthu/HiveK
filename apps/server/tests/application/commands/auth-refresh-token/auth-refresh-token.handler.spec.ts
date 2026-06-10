import { AuthRefreshTokenCommandHandler } from '@/application/commands/auth-refresh-token/auth-refresh-token.handler';
import { AuthRefreshTokenCommand } from '@/application/commands/auth-refresh-token/auth-refresh-token.command';
import { ERoleType } from '@/core/enums';
import { InvalidRefreshTokenException, UserNotFoundException } from '@/core/exceptions';
import { createMockUserRepository } from '../../../__mocks__/mock-repositories';
import { createMockAuthService, createMockJwtService } from '../../../__mocks__/mock-services';

describe('AuthRefreshTokenCommandHandler', () => {
  let handler: AuthRefreshTokenCommandHandler;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockJwtService: ReturnType<typeof createMockJwtService>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockJwtService = createMockJwtService();
    mockAuthService = createMockAuthService();

    handler = new AuthRefreshTokenCommandHandler(
      mockUserRepository,
      mockJwtService as any,
      mockAuthService as any,
    );
  });

  const createMockUser = (overrides = {}) => ({
    id: 'user-123',
    email: 'test@example.com',
    roleId: 'role-123',
    type: ERoleType.KOL,
    refreshToken: 'valid-token',
    updateRefreshToken: jest.fn(),
    ...overrides,
  });

  describe('Happy Paths', () => {
    it('should successfully refresh tokens', async () => {
      const input = { refreshToken: 'valid-token' };
      const command = new AuthRefreshTokenCommand(input);
      const mockUser = createMockUser();

      mockJwtService.verify!.mockReturnValue({ sub: 'user-123' } as any);
      mockUserRepository.findById.mockResolvedValue(mockUser as any);
      mockAuthService.generateTokens!.mockResolvedValue({
        accessToken: 'new-at',
        refreshToken: 'new-rt',
      });

      const result = await handler.execute(command);

      expect(result).toEqual({
        accessToken: 'new-at',
        refreshToken: 'new-rt',
      });
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token');
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
      expect(mockAuthService.generateTokens).toHaveBeenCalledWith({
        sub: 'user-123',
        email: 'test@example.com',
        role: 'role-123',
        type: ERoleType.KOL,
      });
      expect(mockUser.updateRefreshToken).toHaveBeenCalledWith('new-rt');
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('Sad Paths', () => {
    it('should throw InvalidRefreshTokenException if JWT verification fails', async () => {
      const input = { refreshToken: 'invalid' };
      const command = new AuthRefreshTokenCommand(input);

      mockJwtService.verify!.mockImplementation(() => { throw new Error('expired'); });

      await expect(handler.execute(command)).rejects.toThrow(InvalidRefreshTokenException);
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw UserNotFoundException if user in token does not exist', async () => {
      const input = { refreshToken: 'valid-token' };
      const command = new AuthRefreshTokenCommand(input);

      mockJwtService.verify!.mockReturnValue({ sub: 'nonexistent' } as any);
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
    });

    it('should throw InvalidRefreshTokenException if token does not match stored token', async () => {
      const input = { refreshToken: 'old-token' };
      const command = new AuthRefreshTokenCommand(input);
      const mockUser = createMockUser({ refreshToken: 'current-token' });

      mockJwtService.verify!.mockReturnValue({ sub: 'user-123' } as any);
      mockUserRepository.findById.mockResolvedValue(mockUser as any);

      await expect(handler.execute(command)).rejects.toThrow(InvalidRefreshTokenException);
      expect(mockAuthService.generateTokens).not.toHaveBeenCalled();
    });
  });
});
