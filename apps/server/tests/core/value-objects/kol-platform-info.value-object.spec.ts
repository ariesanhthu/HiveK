import { KolPlatformInfo } from '@core/value-objects/kol-platform-info.value-object';

describe('KolPlatformInfo Value Object', () => {
  const props1 = {
    platformId: 'platform-1',
    uniqueId: 'kol_handle_1',
    externalId: 'ext-123',
    followerCount: 1500,
    avgEngagement: 4.5,
    topTags: ['tech', 'gaming'],
    categories: ['Technology'],
  };

  const props2 = {
    platformId: 'platform-2',
    uniqueId: 'kol_handle_2',
    externalId: 'ext-456',
    followerCount: 2500,
    avgEngagement: 3.2,
    topTags: ['fashion'],
    categories: ['Lifestyle'],
  };

  it('should create a valid KolPlatformInfo object and get its properties', () => {
    const platformInfo = KolPlatformInfo.create(props1);

    expect(platformInfo).toBeDefined();
    expect(platformInfo.platformId).toBe(props1.platformId);
    expect(platformInfo.uniqueId).toBe(props1.uniqueId);
    expect(platformInfo.externalId).toBe(props1.externalId);
    expect(platformInfo.followerCount).toBe(props1.followerCount);
    expect(platformInfo.avgEngagement).toBe(props1.avgEngagement);
    expect(platformInfo.topTags).toEqual(props1.topTags);
    expect(platformInfo.categories).toEqual(props1.categories);
  });

  it('should compare equality correctly based on properties', () => {
    const vo1 = KolPlatformInfo.create(props1);
    const vo2 = KolPlatformInfo.create({ ...props1 });
    const vo3 = KolPlatformInfo.create(props2);

    // Same properties
    expect(vo1.equals(vo2)).toBe(true);

    // Different properties
    expect(vo1.equals(vo3)).toBe(false);

    // Undefined/null input
    expect(vo1.equals(undefined)).toBe(false);
  });
});
