import { EnterpriseUserRoot } from '@core/aggregate-roots/enterprise-user.aggregate';
import { ERoleType } from '@core/enums';

describe('EnterpriseUserRoot', () => {
  const validProps = {
    email: 'ent@example.com',
    phone: '1234567890',
    passwordHash: 'hashedpassword',
    type: ERoleType.ENTERPRISE,
    roleId: 'role-ent',
    isEmailVerified: true,
    fullName: 'Ent Owner',
    avatar: undefined,
    enterpriseIds: ['enterprise-123'],
    createdAt: new Date(),
    updatedAt: new Date(),
    deleteAt: null,
    deleteBy: null,
    refreshToken: null,
    googleId: null,
  };

  it('should create a valid EnterpriseUserRoot when type is ENTERPRISE', () => {
    const user = EnterpriseUserRoot.create(validProps);
    expect(user).toBeDefined();
    expect(user.type).toBe(ERoleType.ENTERPRISE);
    expect(user.enterpriseIds).toEqual([]);
  });

  it('should throw an error when type is not ENTERPRISE during creation', () => {
    expect(() => {
      EnterpriseUserRoot.create({ ...validProps, type: ERoleType.KOL });
    }).toThrow('Invalid user type for EnterpriseUserRoot');
  });

  it('should instantiate EnterpriseUserRoot with id', () => {
    const user = EnterpriseUserRoot.instantiate('user-id-456', validProps);
    expect(user).toBeDefined();
    expect(user.id).toBe('user-id-456');
    expect(user.enterpriseIds).toEqual(['enterprise-123']);
  });

  it('should add an enterprise if it does not exist', () => {
    const user = EnterpriseUserRoot.instantiate('user-id-456', {
      ...validProps,
      enterpriseIds: [],
    });
    user.addEnterprise('new-ent');
    expect(user.enterpriseIds).toContain('new-ent');
  });

  it('should not add a duplicate enterprise', () => {
    const user = EnterpriseUserRoot.instantiate('user-id-456', {
      ...validProps,
      enterpriseIds: ['ent-1'],
    });
    user.addEnterprise('ent-1');
    expect(user.enterpriseIds).toHaveLength(1);
  });

  it('should revoke an enterprise', () => {
    const user = EnterpriseUserRoot.instantiate('user-id-456', {
      ...validProps,
      enterpriseIds: ['ent-1', 'ent-2'],
    });
    user.revokeEnterprise('ent-1');
    expect(user.enterpriseIds).not.toContain('ent-1');
    expect(user.enterpriseIds).toContain('ent-2');
  });
});
