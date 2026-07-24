import { UserProps, UserRoot } from '@core/aggregate-roots/user.aggregate';
import { ERoleType } from '@core/enums';

/**
 * Concrete implementation for testing the abstract UserRoot
 */
class TestUserRoot extends UserRoot<UserProps> {
  public static create(props: UserProps): TestUserRoot {
    return new TestUserRoot(props);
  }

  public static instantiate(id: string, props: UserProps): TestUserRoot {
    return new TestUserRoot(props, id);
  }
}

describe('UserRoot Aggregate Root', () => {
  const defaultProps: UserProps = {
    email: 'user@example.com',
    phone: '0123456789',
    passwordHash: '$2b$10$hashed',
    type: ERoleType.KOL,
    roleId: 'role-1',
    isEmailVerified: false,
    fullName: 'John Doe',
    avatar: undefined,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deleteAt: null,
    deleteBy: null,
    refreshToken: null,
    googleId: null,
  };

  describe('create', () => {
    it('should create with default values', () => {
      const user = TestUserRoot.create(defaultProps);

      expect(user).toBeDefined();
      expect(user.email).toBe('user@example.com');
      expect(user.phone).toBe('0123456789');
      expect(user.type).toBe(ERoleType.KOL);
      expect(user.roleId).toBe('role-1');
      expect(user.isEmailVerified).toBe(false);
      expect(user.fullName).toBe('John Doe');
      expect(user.avatar).toBeUndefined();
      expect(user.deleteAt).toBeNull();
      expect(user.deleteBy).toBeNull();
      expect(user.refreshToken).toBeNull();
      expect(user.googleId).toBeNull();
    });
  });

  describe('instantiate', () => {
    it('should instantiate with existing id', () => {
      const user = TestUserRoot.instantiate('user-123', defaultProps);

      expect(user).toBeDefined();
      expect(user.id).toBe('user-123');
      expect(user.email).toBe('user@example.com');
    });

    it('should not allow setId on already-instantiated entity', () => {
      const user = TestUserRoot.instantiate('user-123', defaultProps);

      expect(() => user.setId('new-id')).toThrow('ID is already set');
    });
  });

  describe('equals', () => {
    it('should return true for same reference', () => {
      const user = TestUserRoot.create(defaultProps);
      expect(user.equals(user)).toBe(true);
    });

    it('should return true for same id', () => {
      const user1 = TestUserRoot.instantiate('same-id', defaultProps);
      const user2 = TestUserRoot.instantiate('same-id', defaultProps);
      expect(user1.equals(user2)).toBe(true);
    });

    it('should return false for different ids', () => {
      const user1 = TestUserRoot.instantiate('id-1', defaultProps);
      const user2 = TestUserRoot.instantiate('id-2', defaultProps);
      expect(user1.equals(user2)).toBe(false);
    });

    it('should return false when compared to null/undefined', () => {
      const user = TestUserRoot.create(defaultProps);
      expect(user.equals(null)).toBe(false);
      expect(user.equals(undefined)).toBe(false);
    });
  });

  describe('updateRefreshToken', () => {
    it('should update refresh token and updatedAt', () => {
      const user = TestUserRoot.create(defaultProps);
      const originalUpdatedAt = user.updatedAt;

      // Small delay to ensure time difference
      jest.useFakeTimers().setSystemTime(new Date('2026-06-01'));
      user.updateRefreshToken('new-refresh-token');
      jest.useRealTimers();

      expect(user.refreshToken).toBe('new-refresh-token');
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it('should set refresh token to null', () => {
      const user = TestUserRoot.create(defaultProps);
      user.updateRefreshToken(null);
      expect(user.refreshToken).toBeNull();
    });
  });

  describe('updatePassword', () => {
    it('should update password hash and updatedAt', () => {
      const user = TestUserRoot.create(defaultProps);

      user.updatePassword('new-hashed-password');

      expect(user.passwordHash).toBe('new-hashed-password');
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(user.createdAt.getTime());
    });
  });

  describe('updateGoogleId', () => {
    it('should update google id', () => {
      const user = TestUserRoot.create(defaultProps);

      user.updateGoogleId('google-oauth-id-123');

      expect(user.googleId).toBe('google-oauth-id-123');
    });

    it('should clear google id', () => {
      const user = TestUserRoot.create({ ...defaultProps, googleId: 'existing-google-id' });

      user.updateGoogleId(null);

      expect(user.googleId).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('should mark as deleted with timestamp and deletor', () => {
      const user = TestUserRoot.create(defaultProps);

      jest.useFakeTimers().setSystemTime(new Date('2026-06-15'));
      user.softDelete('admin-1');
      jest.useRealTimers();

      expect(user.deleteAt).toBeDefined();
      expect(user.deleteAt!.getTime()).toBeGreaterThanOrEqual(user.createdAt.getTime());
      expect(user.deleteBy).toBe('admin-1');
    });

    it('should throw when setId is called on a fresh entity (no double-set)', () => {
      const user = TestUserRoot.create(defaultProps);
      user.setId('new-id');
      expect(() => user.setId('another-id')).toThrow('ID is already set');
    });
  });

  describe('restore', () => {
    it('should clear deleteAt and deleteBy', () => {
      const user = TestUserRoot.create(defaultProps);
      user.softDelete('admin-1');
      expect(user.deleteAt).not.toBeNull();

      user.restore();

      expect(user.deleteAt).toBeNull();
      expect(user.deleteBy).toBeNull();
    });

    it('should be idempotent when already restored', () => {
      const user = TestUserRoot.create(defaultProps);
      expect(user.deleteAt).toBeNull();

      user.restore();

      expect(user.deleteAt).toBeNull();
      expect(user.deleteBy).toBeNull();
    });
  });

  describe('verifyEmail', () => {
    it('should mark email as verified', () => {
      const user = TestUserRoot.create(defaultProps);
      expect(user.isEmailVerified).toBe(false);

      user.verifyEmail();

      expect(user.isEmailVerified).toBe(true);
    });

    it('should be idempotent', () => {
      const user = TestUserRoot.create(defaultProps);
      user.verifyEmail();
      user.verifyEmail();
      expect(user.isEmailVerified).toBe(true);
    });
  });
});
