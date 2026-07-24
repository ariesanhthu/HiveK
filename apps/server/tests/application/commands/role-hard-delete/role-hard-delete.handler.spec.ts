import { RoleHardDeleteCommand } from '@/application/commands/role-hard-delete/role-hard-delete.command';
import { RoleHardDeleteCommandHandler } from '@/application/commands/role-hard-delete/role-hard-delete.handler';
import { InvalidOperationException, RoleNotFoundException } from '@/core/exceptions';

describe('RoleHardDeleteCommandHandler', () => {
  let handler: RoleHardDeleteCommandHandler;
  let mockRoleRepository: any;
  let mockUserRepository: any;
  let mockUow: any;

  beforeEach(() => {
    mockRoleRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };
    mockUserRepository = {
      existsByRoleId: jest.fn(),
    };
    mockUow = {
      execute: jest.fn((fn: any) => fn()),
    };
    handler = new RoleHardDeleteCommandHandler(
      mockRoleRepository,
      mockUserRepository,
      mockUow,
    );
  });

  it('should hard delete role successfully if no users attached', async () => {
    mockRoleRepository.findById.mockResolvedValue({ id: 'role-123' });
    mockUserRepository.existsByRoleId.mockResolvedValue(false);

    const command = new RoleHardDeleteCommand('role-123');
    await handler.execute(command);

    expect(mockRoleRepository.findById).toHaveBeenCalledWith('role-123');
    expect(mockRoleRepository.delete).toHaveBeenCalledWith('role-123');
  });

  it('should throw InvalidOperationException if users are attached to role', async () => {
    mockRoleRepository.findById.mockResolvedValue({ id: 'role-123' });
    mockUserRepository.existsByRoleId.mockResolvedValue(true);

    const command = new RoleHardDeleteCommand('role-123');
    await expect(handler.execute(command)).rejects.toThrow(InvalidOperationException);
  });

  it('should throw NotFoundException if role not found', async () => {
    mockRoleRepository.findById.mockResolvedValue(null);

    const command = new RoleHardDeleteCommand('role-123');
    await expect(handler.execute(command)).rejects.toThrow(RoleNotFoundException);
  });
});
