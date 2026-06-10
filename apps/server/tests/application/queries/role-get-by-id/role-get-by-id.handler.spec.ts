import { RoleGetByIdQueryHandler } from '@/application/queries/role-get-by-id/role-get-by-id.handler';
import { RoleGetByIdQuery } from '@/application/queries/role-get-by-id/role-get-by-id.query';
import { RoleNotFoundException } from '@/core/exceptions';

describe('RoleGetByIdQueryHandler', () => {
  let handler: RoleGetByIdQueryHandler;
  let mockRoleReadService: any;

  beforeEach(() => {
    mockRoleReadService = {
      findById: jest.fn(),
    };
    handler = new RoleGetByIdQueryHandler(mockRoleReadService);
  });

  it('should return the role if found', async () => {
    const mockRole = { id: 'role-123', title: 'Admin' };
    mockRoleReadService.findById.mockResolvedValue(mockRole);

    const query = new RoleGetByIdQuery('role-123');
    const result = await handler.execute(query);

    expect(result).toBe(mockRole);
    expect(mockRoleReadService.findById).toHaveBeenCalledWith('role-123');
  });

  it('should throw NotFoundException if role not found', async () => {
    mockRoleReadService.findById.mockResolvedValue(null);

    const query = new RoleGetByIdQuery('role-123');
    await expect(handler.execute(query)).rejects.toThrow(RoleNotFoundException);
  });
});
