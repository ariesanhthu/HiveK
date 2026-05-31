import { RoleHardDeleteCommandHandler } from '@/application/commands/role-hard-delete/role-hard-delete.handler';
import { RoleHardDeleteCommand } from '@/application/commands/role-hard-delete/role-hard-delete.command';
import { RoleNotFoundException } from '@/core/exceptions';

describe('RoleHardDeleteCommandHandler', () => {
  let handler: RoleHardDeleteCommandHandler;
  let mockRoleRepository: any;

  beforeEach(() => {
    mockRoleRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };
    handler = new RoleHardDeleteCommandHandler(mockRoleRepository);
  });

  it('should hard delete role successfully', async () => {
    const mockRole = { _id: 'role-123' };
    mockRoleRepository.findById.mockResolvedValue(mockRole);

    const command = new RoleHardDeleteCommand('role-123');
    await handler.execute(command);

    expect(mockRoleRepository.findById).toHaveBeenCalledWith('role-123');
    expect(mockRoleRepository.delete).toHaveBeenCalledWith('role-123');
  });

  it('should throw NotFoundException if role not found', async () => {
    mockRoleRepository.findById.mockResolvedValue(null);

    const command = new RoleHardDeleteCommand('role-123');
    await expect(handler.execute(command)).rejects.toThrow(RoleNotFoundException);
  });
});
