import { RoleRoot } from '@core/aggregate-roots/role.aggregate';

describe('RoleRoot Aggregate Root', () => {
  const createProps = {
    title: 'Admin',
    permissions: ['read', 'write'],
    type: 'admin' as any,
  };

  it('should create and read properties correctly', () => {
    const root = RoleRoot.create(createProps);

    expect(root).toBeDefined();
    expect(root.title).toBe(createProps.title);
    expect(root.permissions).toEqual(createProps.permissions);
    expect(root.createdAt).toBeInstanceOf(Date);
    expect(root.updatedAt).toBeInstanceOf(Date);
  });

  it('should update correctly', () => {
    const root = RoleRoot.create(createProps);
    const initialUpdatedAt = root.updatedAt;

    root.update({ title: 'Super Admin', permissions: ['*'] });
    expect(root.title).toBe('Super Admin');
    expect(root.permissions).toEqual(['*']);
    expect(root.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt.getTime());
  });

  it('should update permissions correctly', () => {
    const root = RoleRoot.create(createProps);
    const newPermissions = ['read', 'write', 'delete'];

    root.updatePermissions(newPermissions);
    expect(root.permissions).toEqual(newPermissions);
  });
});
