import { BaseValueObject } from '../common';

export interface SubscriptionItemProps {
  packageId: string;
  packageVariantId: string;
  startDate: Date;
  expiresAt: Date;
  billId: string;
}

export class SubscriptionItemVO extends BaseValueObject<SubscriptionItemProps> {
  constructor(props: SubscriptionItemProps) {
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

  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }
}
