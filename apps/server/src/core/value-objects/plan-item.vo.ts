import { BaseValueObject } from '../common';

export interface PlanItemProps {
  packageId: string;
  packageVariantId: string;
  startDate: Date;
  expiresAt: Date;
  billId: string;
  autoRenew: boolean;
  price: number;
  priceAfterDiscount: number;
}

export class PlanItemVO extends BaseValueObject<PlanItemProps> {
  constructor(props: PlanItemProps) {
    super(props);
  }

  get packageId(): string {
    return this.props.packageId;
  }

  get packageVariantId(): string {
    return this.props.packageVariantId;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get billId(): string {
    return this.props.billId;
  }

  get autoRenew(): boolean {
    return this.props.autoRenew;
  }

  get price(): number {
    return this.props.price;
  }

  get priceAfterDiscount(): number {
    return this.props.priceAfterDiscount;
  }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }
}
