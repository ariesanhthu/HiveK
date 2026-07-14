import { BaseValueObject } from '../common';

export interface AddonItemProps {
  packageId: string;
  packageVariantId: string;
  purchasedAt: Date;
  expiresAt: Date | null;
  billId: string;
  price: number;
  priceAfterDiscount: number;
}

export class AddonItemVO extends BaseValueObject<AddonItemProps> {
  constructor(props: AddonItemProps) {
    super(props);
  }

  get packageId(): string {
    return this.props.packageId;
  }

  get packageVariantId(): string {
    return this.props.packageVariantId;
  }

  get purchasedAt(): Date {
    return this.props.purchasedAt;
  }

  get expiresAt(): Date | null {
    return this.props.expiresAt;
  }

  get billId(): string {
    return this.props.billId;
  }

  get price(): number {
    return this.props.price;
  }

  get priceAfterDiscount(): number {
    return this.props.priceAfterDiscount;
  }

  isExpired(): boolean {
    if (this.props.expiresAt === null) return false;
    return new Date() > this.props.expiresAt;
  }
}
