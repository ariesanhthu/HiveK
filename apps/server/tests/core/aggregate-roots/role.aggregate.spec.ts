import { RoleRoot } from '@core/aggregate-roots/role.aggregate';

describe('RoleRoot Aggregate Root', () => {
  const createProps = {
    title: 'Admin',
    permissions: ['read', 'write'],
    isBlocked: false,
  };

  it('should create and read properties correctly', () => {
    const root = RoleRoot.create(createProps);

    expect(root).toBeDefined();
    expect(root.title).toBe(createProps.title);
    expect(root.permissions).toEqual(createProps.permissions);
    expect(root.isBlocked).toBe(createProps.isBlocked);
    expect(root.createdAt).toBeInstanceOf(Date);
    expect(root.updatedAt).toBeInstanceOf(Date);
  });

  it('should block and unblock correctly', () => {
    const root = RoleRoot.create(createProps);
    const initialCreatedAt = root.createdAt;

    root.block();
    expect(root.isBlocked).toBe(true);
    expect(root.updatedAt.getTime()).toBeGreaterThanOrEqual(initialCreatedAt.getTime());

    const beforeUnblock = root.updatedAt;
    root.unblock();
    expect(root.isBlocked).toBe(false);
    expect(root.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUnblock.getTime());
  });

  it('should update permissions correctly', () => {
    const root = RoleRoot.create(createProps);
    const newPermissions = ['read', 'write', 'delete'];

    root.updatePermissions(newPermissions);
    expect(root.permissions).toEqual(newPermissions);
  });
});
