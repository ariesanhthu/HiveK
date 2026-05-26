import { RoleRestoreCommandHandler } from '@/application/commands/role-restore/role-restore.handler';
import { RoleRestoreCommand } from '@/application/commands/role-restore/role-restore.command';
import { NotFoundException } from '@nestjs/common';

describe('RoleRestoreCommandHandler', () => {
  let handler: RoleRestoreCommandHandler;
  let mockRoleRepository: any;

  beforeEach(() => {
    mockRoleRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new RoleRestoreCommandHandler(mockRoleRepository);
  });

  it('should restore role successfully', async () => {
    const mockRole = {
      restore: jest.fn(),
    };
    mockRoleRepository.findById.mockResolvedValue(mockRole);

    const command = new RoleRestoreCommand('role-123');
    await handler.execute(command);

    expect(mockRoleRepository.findById).toHaveBeenCalledWith('role-123');
    expect(mockRole.restore).toHaveBeenCalled();
    expect(mockRoleRepository.save).toHaveBeenCalledWith(mockRole);
  });

  it('should throw NotFoundException if role not found', async () => {
    mockRoleRepository.findById.mockResolvedValue(null);

    const command = new RoleRestoreCommand('role-123');
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });
});
