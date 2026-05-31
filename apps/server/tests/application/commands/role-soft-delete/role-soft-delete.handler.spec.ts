import { RoleSoftDeleteCommandHandler } from '@/application/commands/role-soft-delete/role-soft-delete.handler';
import { RoleSoftDeleteCommand } from '@/application/commands/role-soft-delete/role-soft-delete.command';
import { RoleNotFoundException } from '@/core/exceptions';

describe('RoleSoftDeleteCommandHandler', () => {
  let handler: RoleSoftDeleteCommandHandler;
  let mockRoleRepository: any;

  beforeEach(() => {
    mockRoleRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new RoleSoftDeleteCommandHandler(mockRoleRepository);
  });

  it('should soft delete role successfully', async () => {
    const mockRole = {
      softDelete: jest.fn(),
    };
    mockRoleRepository.findById.mockResolvedValue(mockRole);

    const command = new RoleSoftDeleteCommand('role-123', 'admin');
    await handler.execute(command);

    expect(mockRoleRepository.findById).toHaveBeenCalledWith('role-123');
    expect(mockRole.softDelete).toHaveBeenCalledWith('admin');
    expect(mockRoleRepository.save).toHaveBeenCalledWith(mockRole);
  });

  it('should throw NotFoundException if role not found', async () => {
    mockRoleRepository.findById.mockResolvedValue(null);

    const command = new RoleSoftDeleteCommand('role-123', 'admin');
    await expect(handler.execute(command)).rejects.toThrow(RoleNotFoundException);
  });
});
