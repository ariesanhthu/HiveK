import { RoleMapper } from '@/application/mappers/role.mapper';

describe('RoleMapper', () => {
  it('should map RoleRoot to RoleDto', () => {
    const mockRoot = {
      id: 'role-123',
      title: 'Admin',
      permissions: ['read', 'write'],
      isBlocked: false,
      createdAt: new Date('2026-06-01T00:00:00Z'),
      updatedAt: new Date('2026-06-30T00:00:00Z'),
    } as any;

    const dto = RoleMapper.toDto(mockRoot);

    expect(dto).toBeDefined();
    expect(dto.id).toBe('role-123');
    expect(dto.createdAt).toBe('2026-06-01T00:00:00.000Z');
  });

  it('should map list of roots to list of DTOs', () => {
    const mockRoot = {
      id: 'role-123',
      title: 'Admin',
      permissions: ['read', 'write'],
      isBlocked: false,
      createdAt: new Date('2026-06-01T00:00:00Z'),
      updatedAt: new Date('2026-06-30T00:00:00Z'),
    } as any;

    const dtos = RoleMapper.toListDto([mockRoot]);
    expect(dtos).toHaveLength(1);
    expect(dtos[0].id).toBe('role-123');
  });
});
