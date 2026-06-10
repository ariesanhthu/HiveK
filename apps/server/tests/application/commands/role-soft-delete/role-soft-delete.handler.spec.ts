import { RoleSoftDeleteCommandHandler } from '@/application/commands/role-soft-delete/role-soft-delete.handler';
import { RoleSoftDeleteCommand } from '@/application/commands/role-soft-delete/role-soft-delete.command';
import { RoleNotFoundException, InvalidOperationException } from '@/core/exceptions';

describe('RoleSoftDeleteCommandHandler', () => {
  let handler: RoleSoftDeleteCommandHandler;
  let mockRoleRepository: any;
  let mockUserRepository: any;
  let mockUow: any;

  beforeEach(() => {
    mockRoleRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockUserRepository = {
        existsByRoleId: jest.fn(),
    };
    mockUow = {
        execute: jest.fn((fn: any) => fn()),
    };
    handler = new RoleSoftDeleteCommandHandler(
        mockRoleRepository, 
        mockUserRepository, 
        mockUow
    );
  });

  it('should soft delete role successfully if no users attached', async () => {
    const mockRole = {
      softDelete: jest.fn(),
    };
    mockRoleRepository.findById.mockResolvedValue(mockRole);
    mockUserRepository.existsByRoleId.mockResolvedValue(false);

    const command = new RoleSoftDeleteCommand('role-123', 'admin');
    await handler.execute(command);

    expect(mockRoleRepository.findById).toHaveBeenCalledWith('role-123');
    expect(mockRole.softDelete).toHaveBeenCalledWith('admin');
    expect(mockRoleRepository.save).toHaveBeenCalledWith(mockRole);
  });

  it('should throw InvalidOperationException if users are attached to role', async () => {
    mockRoleRepository.findById.mockResolvedValue({ id: 'role-123' });
    mockUserRepository.existsByRoleId.mockResolvedValue(true);

    const command = new RoleSoftDeleteCommand('role-123', 'admin');
    await expect(handler.execute(command)).rejects.toThrow(InvalidOperationException);
  });

  it('should throw NotFoundException if role not found', async () => {
    mockRoleRepository.findById.mockResolvedValue(null);

    const command = new RoleSoftDeleteCommand('role-123', 'admin');
    await expect(handler.execute(command)).rejects.toThrow(RoleNotFoundException);
  });
});
