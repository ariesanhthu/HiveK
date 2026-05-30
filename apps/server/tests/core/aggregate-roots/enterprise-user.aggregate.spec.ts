import { EnterpriseUserRoot } from '@core/aggregate-roots/enterprise-user.aggregate';
import { UserType } from '@core/enums/user-type.enum';

describe('EnterpriseUserRoot', () => {
  const validProps = {
    email: 'ent@example.com',
    phone: '1234567890',
    passwordHash: 'hashedpassword',
    type: UserType.ENTERPRISE,
    roleId: 'role-ent',
    isEmailVerified: true,
    fullName: 'Ent Owner',
    avatar: null,
    enterpriseId: 'enterprise-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should create a valid EnterpriseUserRoot when type is ENTERPRISE', () => {
    const user = EnterpriseUserRoot.create(validProps);
    expect(user).toBeDefined();
    expect(user.type).toBe(UserType.ENTERPRISE);
    expect(user.enterpriseId).toBe('enterprise-123');
  });

  it('should throw an error when type is not ENTERPRISE during creation', () => {
    expect(() => {
      EnterpriseUserRoot.create({ ...validProps, type: UserType.KOL });
    }).toThrow('Invalid user type for EnterpriseUserRoot');
  });

  it('should instantiate EnterpriseUserRoot with id', () => {
    const user = EnterpriseUserRoot.instantiate('user-id-456', validProps);
    expect(user).toBeDefined();
    expect(user.id).toBe('user-id-456');
  });
});
