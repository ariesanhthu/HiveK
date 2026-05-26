import { RoleRoot } from '@core/aggregate-roots/role.aggregate';

describe('RoleRoot Aggregate Root', () => {
  const props = {
    title: 'Admin',
    permissions: ['read', 'write'],
    isBlocked: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  it('should create and read properties correctly', () => {
    const root = RoleRoot.create(props);

    expect(root).toBeDefined();
    expect(root.title).toBe(props.title);
    expect(root.permissions).toEqual(props.permissions);
    expect(root.isBlocked).toBe(props.isBlocked);
    expect(root.createdAt).toBe(props.createdAt);
    expect(root.updatedAt).toBe(props.updatedAt);
  });

  it('should block and unblock correctly', () => {
    const root = RoleRoot.create(props);

    root.block();
    expect(root.isBlocked).toBe(true);
    expect(root.updatedAt.getTime()).toBeGreaterThan(props.createdAt.getTime());

    const beforeUnblock = root.updatedAt;
    root.unblock();
    expect(root.isBlocked).toBe(false);
    expect(root.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUnblock.getTime());
  });

  it('should update permissions correctly', () => {
    const root = RoleRoot.create(props);
    const newPermissions = ['read', 'write', 'delete'];

    root.updatePermissions(newPermissions);
    expect(root.permissions).toEqual(newPermissions);
  });
});
