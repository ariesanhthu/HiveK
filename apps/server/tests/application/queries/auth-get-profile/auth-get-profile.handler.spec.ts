import { AuthGetProfileHandler } from '@/application/queries/auth-get-profile/auth-get-profile.handler';
import { AuthGetProfileQuery } from '@/application/queries/auth-get-profile/auth-get-profile.query';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthGetProfileHandler', () => {
  let handler: AuthGetProfileHandler;
  let mockUserReadService: any;

  beforeEach(() => {
    mockUserReadService = {
      findById: jest.fn(),
    };
    handler = new AuthGetProfileHandler(mockUserReadService);
  });

  it('should return user profile when found', async () => {
    const mockUser = { id: 'user-123', email: 'john@doe.com' };
    mockUserReadService.findById.mockResolvedValue(mockUser);

    const query = new AuthGetProfileQuery('user-123');
    const result = await handler.execute(query);

    expect(result).toEqual(mockUser);
    expect(mockUserReadService.findById).toHaveBeenCalledWith('user-123');
  });

  it('should throw UnauthorizedException when profile not found', async () => {
    mockUserReadService.findById.mockResolvedValue(null);

    const query = new AuthGetProfileQuery('user-123');
    await expect(handler.execute(query)).rejects.toThrow(UnauthorizedException);
  });
});
