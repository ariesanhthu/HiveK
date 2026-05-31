import { RoleUpdateCommandHandler } from '@/application/commands/role-update/role-update.handler';
import { RoleUpdateCommand } from '@/application/commands/role-update/role-update.command';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('RoleUpdateCommandHandler', () => {
  let handler: RoleUpdateCommandHandler;
  let mockRoleRepository: any;

  beforeEach(() => {
    mockRoleRepository = {
      findById: jest.fn(),
      findByTitle: jest.fn(),
      save: jest.fn(),
    };
    handler = new RoleUpdateCommandHandler(mockRoleRepository);
  });

  it('should successfully update role properties', async () => {
    const mockRole = {
      id: 'role-123',
      title: 'Old Title',
      update: jest.fn(),
    };
    mockRoleRepository.findById.mockResolvedValue(mockRole);
    mockRoleRepository.findByTitle.mockResolvedValue(null);

    const command = new RoleUpdateCommand('role-123', {
      title: 'New Title',
      permissions: ['*'],
    });

    await handler.execute(command);
    expect(mockRole.update).toHaveBeenCalledWith({
      title: 'New Title',
      permissions: ['*'],
      type: undefined,
    });
    expect(mockRoleRepository.save).toHaveBeenCalledWith(mockRole);
  });

  it('should throw ConflictException if updated title already exists', async () => {
    const mockRole = {
      id: 'role-123',
      title: 'Old Title',
      update: jest.fn(),
    };
    mockRoleRepository.findById.mockResolvedValue(mockRole);
    mockRoleRepository.findByTitle.mockResolvedValue({ id: 'role-456' });

    const command = new RoleUpdateCommand('role-123', {
      title: 'ExistingTitle',
    });

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
  });

  it('should throw NotFoundException if role not found', async () => {
    mockRoleRepository.findById.mockResolvedValue(null);

    const command = new RoleUpdateCommand('role-123', {
      title: 'New Title',
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });
});
