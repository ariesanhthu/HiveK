import { BaseAggregateRoot } from '../common';
import { EBillType, EBillStatus } from '../enums';
import { BillItemVO } from '../value-objects';
import {
  BillTotalAmountMismatchException,
  BillTaxAmountMismatchException,
  BillFinalAmountMismatchException,
  BillCannotCancelException,
} from '../exceptions';

export interface BillProps {
  billCode: string;
  enterpriseId: string;
  type: EBillType;
  status: EBillStatus;
  items: BillItemVO[];
  totalAmount: number;
  taxAmount: number;
  finalAmount: number;
  currency: string;
  expiresAt: Date | null;
  createdAt: Date;
}

export type BillCreateProps = Omit<
  BillProps,
  'totalAmount' | 'taxAmount' | 'finalAmount' | 'createdAt'
> & {
  totalAmount?: number;
  taxAmount?: number;
  finalAmount?: number;
  createdAt?: Date;
};

export class BillEntity extends BaseAggregateRoot<BillProps> {
  public static create(input: BillCreateProps, id?: string): BillEntity {
    const props = { ...input } as unknown as BillProps;
    const now = new Date();
    props.createdAt = input.createdAt ?? now;

    const calculated = BillEntity.calculateFinancials(
      input.items,
      input.type
    );

    if (input.totalAmount === undefined) props.totalAmount = calculated.totalAmount;
    else if (input.totalAmount !== calculated.totalAmount) {
      throw new BillTotalAmountMismatchException(
        input.totalAmount,
        calculated.totalAmount
      );
    }

    if (input.taxAmount === undefined) props.taxAmount = calculated.taxAmount;
    else if (input.taxAmount !== calculated.taxAmount) {
      throw new BillTaxAmountMismatchException(input.taxAmount, calculated.taxAmount);
    }

    if (input.finalAmount === undefined) props.finalAmount = calculated.finalAmount;
    else if (input.finalAmount !== calculated.finalAmount) {
      throw new BillFinalAmountMismatchException(
        input.finalAmount,
        calculated.finalAmount
      );
    }

    return new BillEntity(props, id);
  }

  public static instantiate(id: string, props: BillProps): BillEntity {
    return new BillEntity(props, id);
  }

  private constructor(props: BillProps, id?: string) {
    super(props, id);
  }

  public cancel(): void {
    if (this.props.status !== EBillStatus.PENDING) {
      throw new BillCannotCancelException(this.id!, this.props.status);
    }
    this.props.status = EBillStatus.CANCELLED;
  }

  public markAsPaid(): void {
    if (this.props.status !== EBillStatus.PENDING) {
      return; // Idempotent: already paid or cancelled
    }
    this.props.status = EBillStatus.DONE;
  }

  private static calculateFinancials(
    items: BillItemVO[],
    type: EBillType
  ) {
    const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
    const taxAmount = items.reduce(
      (sum, item) => sum + (item.price * item.taxPercent) / 100,
      0
    );
    const finalAmount = totalAmount + taxAmount;
    return { totalAmount, taxAmount, finalAmount };
  }

  get billCode(): string {
    return this.props.billCode;
  }

  get enterpriseId(): string {
    return this.props.enterpriseId;
  }

  get type(): EBillType {
    return this.props.type;
  }

  get status(): EBillStatus {
    return this.props.status;
  }

  get items(): BillItemVO[] {
    return this.props.items;
  }

  get totalAmount(): number {
    return this.props.totalAmount;
  }

  get taxAmount(): number {
    return this.props.taxAmount;
  }

  get finalAmount(): number {
    return this.props.finalAmount;
  }

  get currency(): string {
    return this.props.currency;
  }

  get expiresAt(): Date | null {
    return this.props.expiresAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
