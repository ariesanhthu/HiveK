import { BaseValueObject } from '../common';
import { EBillLineType, EPurchaseType } from '../enums';

export interface BillItemProps {
  lineType: EBillLineType;
  packageId: string | null;
  packageVariantId: string | null;
  creditType: string | null;
  creditAmount: number | null;
  price: number;
  taxPercent: number;
  purchaseType: EPurchaseType;
}

export class BillItemVO extends BaseValueObject<BillItemProps> {
  constructor(props: BillItemProps) {
    super(props);
  }

  get lineType(): EBillLineType {
    return this.props.lineType;
  }

  get packageId(): string | null {
    return this.props.packageId;
  }

  get packageVariantId(): string | null {
    return this.props.packageVariantId;
  }

  get creditType(): string | null {
    return this.props.creditType;
  }

  get creditAmount(): number | null {
    return this.props.creditAmount;
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
