import { KOLUserRoot } from '@core/aggregate-roots/kol-user.aggregate';
import { ERoleType } from '@core/enums';

describe('KOLUserRoot', () => {
  const validProps = {
    email: 'kol@example.com',
    phone: '1234567890',
    passwordHash: 'hashedpassword',
    type: ERoleType.KOL,
    roleId: 'role-kol',
    isEmailVerified: true,
    fullName: 'KOL User',
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should create a valid KOLUserRoot when type is KOL', () => {
    const user = KOLUserRoot.create(validProps);
    expect(user).toBeDefined();
    expect(user.type).toBe(ERoleType.KOL);
    expect(user.fullName).toBe('KOL User');
  });

  it('should throw an error when type is not KOL during creation', () => {
    expect(() => {
      KOLUserRoot.create({ ...validProps, type: ERoleType.ADMIN });
    }).toThrow('Invalid user type for KOLUserRoot');
  });

  it('should instantiate KOLUserRoot with id', () => {
    const user = KOLUserRoot.instantiate('user-id-123', validProps);
    expect(user).toBeDefined();
    expect(user.id).toBe('user-id-123');
  });
});
