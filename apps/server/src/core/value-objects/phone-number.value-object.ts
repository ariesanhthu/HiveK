import { BaseValueObject } from '../common/base.value-object';

export interface PhoneNumberProps {
  value: string;
}

/**
 * Value object representing a phone number in international format (+...).
 */
export class PhoneNumber extends BaseValueObject<PhoneNumberProps> {
  private static readonly PHONE_REGEX = /^\+\d+$/;

  private constructor(props: PhoneNumberProps) {
    super(props);
  }

  public static create(props: PhoneNumberProps): PhoneNumber {
    if (!props.value) {
      throw new Error('Phone number is required');
    }

    if (!PhoneNumber.PHONE_REGEX.test(props.value)) {
      throw new Error(
        `Invalid phone number format: "${props.value}". Must start with "+" followed by digits only (e.g., "+84123456789").`,
      );
    }

    return new PhoneNumber(props);
  }

  get value(): string {
    return this.props.value;
  }
}