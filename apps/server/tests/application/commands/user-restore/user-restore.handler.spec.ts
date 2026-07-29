import { UserRestoreCommandHandler } from '@/application/commands/user-restore/user-restore.handler';
import { UserRestoreCommand } from '@/application/commands/user-restore/user-restore.command';
import { UserNotFoundException } from '@/core/exceptions';

describe('UserRestoreCommandHandler', () => {
  let handler: UserRestoreCommandHandler;
  let mockUserRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      findByIdIncludingDeleted: jest.fn(),
      save: jest.fn(),
    };
    handler = new UserRestoreCommandHandler(mockUserRepository);
  });

  it('should restore user successfully', async () => {
    const mockUser = {
      restore: jest.fn(),
    };
    mockUserRepository.findByIdIncludingDeleted.mockResolvedValue(mockUser);

    const command = new UserRestoreCommand('user-123');
    await handler.execute(command);

    expect(mockUserRepository.findByIdIncludingDeleted).toHaveBeenCalledWith('user-123');
    expect(mockUser.restore).toHaveBeenCalled();
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
  });

  it('should throw NotFoundException if user not found', async () => {
    mockUserRepository.findByIdIncludingDeleted.mockResolvedValue(null);

    const command = new UserRestoreCommand('user-123');
    await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
  });
});
