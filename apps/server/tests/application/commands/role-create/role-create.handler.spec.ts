import { RoleCreateCommandHandler } from '@/application/commands/role-create/role-create.handler';
import { RoleCreateCommand } from '@/application/commands/role-create/role-create.command';
import { ERoleType } from '@/core/enums';
import { RoleConflictException } from '@/core/exceptions';

describe('RoleCreateCommandHandler', () => {
  let handler: RoleCreateCommandHandler;
  let mockRoleRepository: any;

  beforeEach(() => {
    mockRoleRepository = {
      findByTitle: jest.fn(),
      save: jest.fn().mockImplementation((role: any) => {
        role.setId('some-role-id');
        return Promise.resolve();
      }),
    };
    handler = new RoleCreateCommandHandler(mockRoleRepository);
  });

  it('should successfully create a new role', async () => {
    mockRoleRepository.findByTitle.mockResolvedValue(null);

    const command = new RoleCreateCommand({
      title: 'CustomRole',
      permissions: ['read', 'write'],
      type: ERoleType.KOL,
    });

    const result = await handler.execute(command);
    expect(result).toBeDefined();
    expect(mockRoleRepository.findByTitle).toHaveBeenCalledWith('CustomRole');
    expect(mockRoleRepository.save).toHaveBeenCalled();
  });

  it('should throw ConflictException if role title already exists', async () => {
    mockRoleRepository.findByTitle.mockResolvedValue({ id: 'role-123' });

    const command = new RoleCreateCommand({
      title: 'CustomRole',
      permissions: ['read', 'write'],
      type: ERoleType.KOL,
    });

    await expect(handler.execute(command)).rejects.toThrow(RoleConflictException);
  });
});
