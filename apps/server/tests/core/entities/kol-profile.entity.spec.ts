import { KolProfileEntity, KolProfileProps } from '@core/entities/kol-profile.entity';
import { KolPlatformInfoVO } from '@core/value-objects/kol-platform-info.value-object';

describe('KolProfileEntity', () => {
  const createDefaultProps = (): KolProfileProps => ({
    userId: null,
    verificationType: null,
    name: 'Test Influencer',
    location: 'Vietnam',
    gender: 'female',
    bio: 'A test KOL profile',
    email: 'kol@example.com',
    phone: '0123456789',
    platforms: [],
    isVerified: false,
    scores: {},
    deleteAt: null,
    deleteBy: null,
  });

  const createPlatform = (platformId: string, externalId: string) =>
    KolPlatformInfoVO.create({
      platformId,
      uniqueId: externalId,
      externalId,
      followerCount: 10000,
      avgEngagement: 3.5,
      topTags: ['tech', 'lifestyle'],
      categories: ['technology'],
    });

  describe('create', () => {
    it('should create with all fields', () => {
      const entity = KolProfileEntity.create(createDefaultProps());

      expect(entity).toBeDefined();
      expect(entity.name).toBe('Test Influencer');
      expect(entity.location).toBe('Vietnam');
      expect(entity.gender).toBe('female');
      expect(entity.bio).toBe('A test KOL profile');
      expect(entity.email).toBe('kol@example.com');
      expect(entity.phone).toBe('0123456789');
      expect(entity.platforms).toEqual([]);
      expect(entity.isVerified).toBe(false);
      expect(entity.scores).toEqual({});
      expect(entity.userId).toBeNull();
      expect(entity.verificationType).toBeNull();
      expect(entity.deleteAt).toBeNull();
      expect(entity.deleteBy).toBeNull();
    });

    it('should create with id', () => {
      const entity = KolProfileEntity.create(createDefaultProps(), 'profile-123');
      expect(entity.id).toBe('profile-123');
    });
  });

  describe('instantiate', () => {
    it('should restore existing entity with id', () => {
      const entity = KolProfileEntity.instantiate('existing-1', createDefaultProps());
      expect(entity.id).toBe('existing-1');
      expect(entity.name).toBe('Test Influencer');
    });
  });

  describe('linkUser', () => {
    it('should link user and set verification', () => {
      const entity = KolProfileEntity.create(createDefaultProps());
      expect(entity.isVerified).toBe(false);
      expect(entity.userId).toBeNull();

      entity.linkUser('user-123', 'email');

      expect(entity.userId).toBe('user-123');
      expect(entity.verificationType).toBe('email');
      expect(entity.isVerified).toBe(true);
    });
  });

  describe('addPlatform', () => {
    it('should add platform to empty list', () => {
      const entity = KolProfileEntity.create(createDefaultProps());
      const platform = createPlatform('plat-1', 'tiktok-user-1');

      entity.addPlatform(platform);

      expect(entity.platforms).toHaveLength(1);
      expect(entity.platforms[0].externalId).toBe('tiktok-user-1');
    });

    it('should not add duplicate platform', () => {
      const entity = KolProfileEntity.create(createDefaultProps());
      const platform = createPlatform('plat-1', 'tiktok-user-1');

      entity.addPlatform(platform);
      entity.addPlatform(platform);

      expect(entity.platforms).toHaveLength(1);
    });

    it('should add multiple different platforms', () => {
      const entity = KolProfileEntity.create(createDefaultProps());
      const tiktok = createPlatform('plat-1', 'tt-user-1');
      const instagram = createPlatform('plat-2', 'ig-user-1');

      entity.addPlatform(tiktok);
      entity.addPlatform(instagram);

      expect(entity.platforms).toHaveLength(2);
    });
  });

  describe('softDelete & restore', () => {
    it('should soft delete with deletor info', () => {
      const entity = KolProfileEntity.create(createDefaultProps());
      entity.softDelete('admin-1');

      expect(entity.deleteAt).toBeInstanceOf(Date);
      expect(entity.deleteBy).toBe('admin-1');
    });

    it('should restore after soft delete', () => {
      const entity = KolProfileEntity.create(createDefaultProps());
      entity.softDelete('admin-1');
      expect(entity.deleteAt).not.toBeNull();

      entity.restore();

      expect(entity.deleteAt).toBeNull();
      expect(entity.deleteBy).toBeNull();
    });
  });
});
