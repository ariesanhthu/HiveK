import { PlatformMapper } from '@/application/mappers/platform.mapper';

describe('PlatformMapper', () => {
  it('should map PlatformRoot to PlatformDto', () => {
    const mockRoot = {
      id: 'plat-123',
      name: 'Facebook',
      baseUrl: 'https://facebook.com',
      apiStatus: 'active',
      iconUrl: 'icon.png',
    } as any;

    const dto = PlatformMapper.toDto(mockRoot);

    expect(dto).toBeDefined();
    expect(dto.id).toBe('plat-123');
    expect(dto.name).toBe('Facebook');
  });

  it('should map list of roots to list of DTOs', () => {
    const mockRoot = {
      id: 'plat-123',
      name: 'Facebook',
      baseUrl: 'https://facebook.com',
      apiStatus: 'active',
      iconUrl: 'icon.png',
    } as any;

    const dtos = PlatformMapper.toListDto([mockRoot]);
    expect(dtos).toHaveLength(1);
    expect(dtos[0].id).toBe('plat-123');
  });
});
