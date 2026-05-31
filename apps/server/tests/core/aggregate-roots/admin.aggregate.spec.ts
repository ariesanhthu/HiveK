import { AdminRoot } from '@core/aggregate-roots/admin.aggregate';
import { ERoleType } from '@core/enums';

describe('AdminRoot', () => {
  const validProps = {
    email: 'admin@example.com',
    phone: '1234567890',
    passwordHash: 'hashedpassword',
    type: ERoleType.ADMIN,
    roleId: 'role-admin',
    isEmailVerified: true,
    fullName: 'Admin User',
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should create a valid AdminRoot when type is ADMIN', () => {
    const user = AdminRoot.create(validProps);
    expect(user).toBeDefined();
    expect(user.type).toBe(ERoleType.ADMIN);
  });

  it('should throw an error when type is not ADMIN during creation', () => {
    expect(() => {
      AdminRoot.create({ ...validProps, type: ERoleType.KOL });
    }).toThrow('Invalid user type for AdminRoot');
  });

  it('should instantiate AdminRoot with id', () => {
    const user = AdminRoot.instantiate('admin-id-123', validProps);
    expect(user).toBeDefined();
    expect(user.id).toBe('admin-id-123');
  });
});
