import { EnterpriseMapper } from '@/application/mappers/enterprise.mapper';

describe('EnterpriseMapper', () => {
  it('should map EnterpriseRoot to EnterpriseDto', () => {
    const mockRoot = {
      id: 'ent-123',
      userId: 'user-123',
      companyName: 'Company Inc',
      description: 'Business',
      contactEmail: 'contact@company.com',
      contactPhone: '123456',
      website: 'company.com',
      taxId: 'TAX123',
      logoUrl: 'logo.png',
      isVerified: true,
      createdAt: new Date('2026-06-01T00:00:00Z'),
      updatedAt: new Date('2026-06-30T00:00:00Z'),
    } as any;

    const dto = EnterpriseMapper.toDto(mockRoot);

    expect(dto).toBeDefined();
    expect(dto.id).toBe('ent-123');
    expect(dto.createdAt).toBe('2026-06-01T00:00:00.000Z');
  });

  it('should map list of roots to list of DTOs', () => {
    const mockRoot = {
      id: 'ent-123',
      userId: 'user-123',
      companyName: 'Company Inc',
      description: 'Business',
      contactEmail: 'contact@company.com',
      contactPhone: '123456',
      website: 'company.com',
      taxId: 'TAX123',
      logoUrl: 'logo.png',
      isVerified: true,
      createdAt: new Date('2026-06-01T00:00:00Z'),
      updatedAt: new Date('2026-06-30T00:00:00Z'),
    } as any;

    const dtos = EnterpriseMapper.toListDto([mockRoot]);
    expect(dtos).toHaveLength(1);
    expect(dtos[0].id).toBe('ent-123');
  });
});
