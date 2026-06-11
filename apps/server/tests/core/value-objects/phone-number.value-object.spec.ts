import { PhoneNumberVO } from '@core/value-objects/phone-number.value-object';

describe('PhoneNumberVO', () => {
  it('should create a valid phone number', () => {
    const phone = '+84123456789';
    const vo = PhoneNumberVO.create({ value: phone });
    expect(vo.value).toBe(phone);
  });

  it('should throw error if phone number is empty', () => {
    expect(() => PhoneNumberVO.create({ value: '' })).toThrow('Phone number is required');
  });

  it('should throw error if phone number does not start with "+"', () => {
    expect(() => PhoneNumberVO.create({ value: '84123456789' })).toThrow('Invalid phone number format');
  });

  it('should throw error if phone number contains non-digits after "+"', () => {
    expect(() => PhoneNumberVO.create({ value: '+84123-456-789' })).toThrow('Invalid phone number format');
  });

  it('should equality check work correctly', () => {
    const vo1 = PhoneNumberVO.create({ value: '+84123456789' });
    const vo2 = PhoneNumberVO.create({ value: '+84123456789' });
    const vo3 = PhoneNumberVO.create({ value: '+84987654321' });

    expect(vo1.equals(vo2)).toBe(true);
    expect(vo1.equals(vo3)).toBe(false);
  });
});
