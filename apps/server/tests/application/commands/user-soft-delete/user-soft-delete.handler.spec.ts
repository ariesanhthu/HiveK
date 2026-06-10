import { UserSoftDeleteCommandHandler } from '@/application/commands/user-soft-delete/user-soft-delete.handler';
import { UserSoftDeleteCommand } from '@/application/commands/user-soft-delete/user-soft-delete.command';
import { UserNotFoundException } from '@/core/exceptions';

describe('UserSoftDeleteCommandHandler', () => {
  let handler: UserSoftDeleteCommandHandler;
  let mockUserRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new UserSoftDeleteCommandHandler(mockUserRepository);
  });

  it('should soft delete user successfully', async () => {
    const mockUser = {
      softDelete: jest.fn(),
    };
    mockUserRepository.findById.mockResolvedValue(mockUser);

    const command = new UserSoftDeleteCommand('user-123', 'admin');
    await handler.execute(command);

    expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
    expect(mockUser.softDelete).toHaveBeenCalledWith('admin');
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
  });

  it('should throw NotFoundException if user not found', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    const command = new UserSoftDeleteCommand('user-123', 'admin');
    await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
  });
});
