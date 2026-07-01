import { BaseValueObject } from '../common';
import { type EPurchaseType } from '../enums';

export interface BillItemProps {
  packageId: string;
  packageVariantId: string;
  price: number;
  taxPercent: number;
  purchaseType: EPurchaseType;
}

export class BillItemVO extends BaseValueObject<BillItemProps> {
  constructor(props: BillItemProps) {
    super(props);
  }

  get packageId(): string {
    return this.props.packageId;
  }

  get packageVariantId(): string {
    return this.props.packageVariantId;
  }

  get price(): number {
    return this.props.price;
  }

  get taxPercent(): number {
    return this.props.taxPercent;
  }

  get purchaseType(): EPurchaseType {
    return this.props.purchaseType;
  }
}
