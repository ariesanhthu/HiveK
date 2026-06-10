import { toCamelCase } from '@/shared/utils/string.util';

describe('string.util toCamelCase', () => {
  it('should convert snake_case to camelCase', () => {
    expect(toCamelCase('logo_url_id')).toBe('logoUrlId');
    expect(toCamelCase('some_random_property_name')).toBe('someRandomPropertyName');
  });

  it('should convert kebab-case to camelCase', () => {
    expect(toCamelCase('logo-url-id')).toBe('logoUrlId');
    expect(toCamelCase('kebab-case-text')).toBe('kebabCaseText');
  });

  it('should convert PascalCase to camelCase', () => {
    expect(toCamelCase('LogoUrlId')).toBe('logoUrlId');
    expect(toCamelCase('PascalCase')).toBe('pascalCase');
  });

  it('should handle empty/falsy inputs', () => {
    expect(toCamelCase('')).toBe('');
    expect(toCamelCase(null as any)).toBe('');
  });

  it('should not mutate already camelCased string', () => {
    expect(toCamelCase('logoUrlId')).toBe('logoUrlId');
    expect(toCamelCase('alreadyCamelCase')).toBe('alreadyCamelCase');
  });
});
