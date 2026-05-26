import { UserMapper } from '@/application/mappers/user.mapper';
import { UserType } from '@/core/enums';

describe('UserMapper', () => {
  it('should map KOL UserRoot to UserDto', () => {
    const mockRoot = {
      id: 'user-123',
      email: 'john@doe.com',
      phone: '123456',
      fullName: 'John Doe',
      roleId: 'role-1',
      isEmailVerified: true,
      createdAt: new Date('2026-06-01T00:00:00Z'),
      updatedAt: new Date('2026-06-30T00:00:00Z'),
      type: UserType.KOL,
    } as any;

    const dto = UserMapper.toDto(mockRoot);

    expect(dto).toBeDefined();
    expect(dto.id).toBe('user-123');
    expect(dto.type).toBe(UserType.KOL);
  });

  it('should map Enterprise UserRoot to UserDto', () => {
    const mockRoot = {
      id: 'user-123',
      email: 'john@doe.com',
      phone: '123456',
      fullName: 'John Doe',
      roleId: 'role-1',
      isEmailVerified: true,
      createdAt: new Date('2026-06-01T00:00:00Z'),
      updatedAt: new Date('2026-06-30T00:00:00Z'),
      type: UserType.ENTERPRISE,
      enterpriseId: 'ent-123',
    } as any;

    const dto = UserMapper.toDto(mockRoot);

    expect(dto).toBeDefined();
    expect(dto.id).toBe('user-123');
    expect(dto.type).toBe(UserType.ENTERPRISE);
    expect((dto as any).enterpriseId).toBe('ent-123');
  });

  it('should map Admin UserRoot to UserDto', () => {
    const mockRoot = {
      id: 'user-123',
      email: 'john@doe.com',
      phone: '123456',
      fullName: 'John Doe',
      roleId: 'role-1',
      isEmailVerified: true,
      createdAt: new Date('2026-06-01T00:00:00Z'),
      updatedAt: new Date('2026-06-30T00:00:00Z'),
      type: UserType.ADMIN,
    } as any;

    const dto = UserMapper.toDto(mockRoot);

    expect(dto).toBeDefined();
    expect(dto.id).toBe('user-123');
    expect(dto.type).toBe(UserType.ADMIN);
  });

  it('should throw error for unknown user type', () => {
    const mockRoot = {
      id: 'user-123',
      email: 'john@doe.com',
      phone: '123456',
      fullName: 'John Doe',
      roleId: 'role-1',
      isEmailVerified: true,
      createdAt: new Date('2026-06-01T00:00:00Z'),
      updatedAt: new Date('2026-06-30T00:00:00Z'),
      type: 'INVALID',
    } as any;

    expect(() => UserMapper.toDto(mockRoot)).toThrow('Unknown user type: INVALID');
  });
});
