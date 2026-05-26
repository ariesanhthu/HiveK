import { UserGetByIdHandler } from '@/application/queries/user-get-by-id/user-get-by-id.handler';
import { UserGetByIdQuery } from '@/application/queries/user-get-by-id/user-get-by-id.query';

describe('UserGetByIdHandler', () => {
  let handler: UserGetByIdHandler;
  let mockUserReadService: any;

  beforeEach(() => {
    mockUserReadService = {
      findById: jest.fn(),
    };
    handler = new UserGetByIdHandler(mockUserReadService);
  });

  it('should return user when found', async () => {
    const mockUser = { id: 'user-123', email: 'john@doe.com' };
    mockUserReadService.findById.mockResolvedValue(mockUser);

    const query = new UserGetByIdQuery('user-123');
    const result = await handler.execute(query);

    expect(result).toEqual(mockUser);
    expect(mockUserReadService.findById).toHaveBeenCalledWith('user-123');
  });

  it('should throw error when user not found', async () => {
    mockUserReadService.findById.mockResolvedValue(null);

    const query = new UserGetByIdQuery('user-123');
    await expect(handler.execute(query)).rejects.toThrow('User not found');
  });
});
