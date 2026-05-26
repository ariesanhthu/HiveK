import { KolProfileMapper } from '@/application/mappers/kol-profile.mapper';

describe('KolProfileMapper', () => {
  it('should map KolProfileEntity to KolProfileDto', () => {
    const mockEntity = {
      id: 'kol-123',
      name: 'John Doe',
      location: 'VN',
      gender: 'M',
      bio: 'bio',
      email: 'john@doe.com',
      phone: '123456',
      isVerified: true,
      scores: { popularity: 85 },
      platforms: [
        {
          platformId: 'plat-1',
          uniqueId: 'john_handle',
          externalId: 'ext-1',
          followerCount: 500,
          avgEngagement: 4.5,
          topTags: ['fashion'],
          categories: ['style'],
        },
      ],
    } as any;

    const dto = KolProfileMapper.toDto(mockEntity);

    expect(dto).toBeDefined();
    expect(dto.id).toBe('kol-123');
    expect(dto.platforms[0].uniqueId).toBe('john_handle');
  });

  it('should map list of entities to list of DTOs', () => {
    const mockEntity = {
      id: 'kol-123',
      name: 'John Doe',
      location: 'VN',
      gender: 'M',
      bio: 'bio',
      email: 'john@doe.com',
      phone: '123456',
      isVerified: true,
      scores: {},
      platforms: [],
    } as any;

    const dtos = KolProfileMapper.toListDto([mockEntity]);
    expect(dtos).toHaveLength(1);
    expect(dtos[0].id).toBe('kol-123');
  });
});
