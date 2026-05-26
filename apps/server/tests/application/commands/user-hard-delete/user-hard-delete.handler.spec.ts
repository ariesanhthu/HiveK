import { UserHardDeleteCommandHandler } from '@/application/commands/user-hard-delete/user-hard-delete.handler';
import { UserHardDeleteCommand } from '@/application/commands/user-hard-delete/user-hard-delete.command';
import { NotFoundException } from '@nestjs/common';

describe('UserHardDeleteCommandHandler', () => {
  let handler: UserHardDeleteCommandHandler;
  let mockUserRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };
    handler = new UserHardDeleteCommandHandler(mockUserRepository);
  });

  it('should hard delete user successfully', async () => {
    const mockUser = {};
    mockUserRepository.findById.mockResolvedValue(mockUser);

    const command = new UserHardDeleteCommand('user-123');
    await handler.execute(command);

    expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
    expect(mockUserRepository.delete).toHaveBeenCalledWith('user-123');
  });

  it('should throw NotFoundException if user not found', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    const command = new UserHardDeleteCommand('user-123');
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });
});
