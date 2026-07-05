import { BaseValueObject } from '../common/base.value-object';
import { EProductPlatform } from '../enums';

export interface VoucherItemProps {
  code: string;
  platform: EProductPlatform;
  discountValue: string;
  description: string;
  expirationDate: Date;
}

export class VoucherItemVO extends BaseValueObject<VoucherItemProps> {
  private constructor(props: VoucherItemProps) {
    super(props);
  }

  public static create(props: VoucherItemProps): VoucherItemVO {
    if (!props.code || props.code.trim().length === 0) {
      throw new Error('Voucher code is required');
    }
    // Expiration date may be in the past (e.g., restoring an archived proposal with expired vouchers).
    // Validation is intentionally skipped here; consumers can check isExpired() at runtime.
    return new VoucherItemVO(props);
  }

  get code(): string {
    return this.props.code;
  }

  get platform(): EProductPlatform {
    return this.props.platform;
  }

  get discountValue(): string {
    return this.props.discountValue;
  }

  get description(): string {
    return this.props.description;
  }

  get expirationDate(): Date {
    return this.props.expirationDate;
  }

  /**
   * Check if the voucher has expired.
   */
  public isExpired(): boolean {
    return new Date() > this.props.expirationDate;
  }
}
