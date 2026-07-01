import { AggregateRoot } from '../abstract';
import { EBillType, EBillStatus } from '../enums';
import { type BillItemVO } from '../value-objects';
import { type Optional } from '../types';
import {
	BillTotalAmountMismatchException,
	BillTaxAmountMismatchException,
	BillFinalAmountMismatchException,
	BillCreditRefundAmountMismatchException,
	BillCreditRefundAmountInvalidException,
	BillCannotCancelException,
} from '../exceptions';

export interface BillProps {
	billCode: string;
	enterpriseId: string;
	type: EBillType;
	status: EBillStatus;
	items: BillItemVO[];
	totalAmount: number;
	creditAmountApplied: number;
	creditAmountRefund: Optional<number>;
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

export class BillEntity extends AggregateRoot<BillProps> {
	public static create(input: BillCreateProps, id?: string): BillEntity {
		const props = { ...input } as unknown as BillProps;
		const now = new Date();
		props.createdAt = input.createdAt ?? now;

		const calculated = BillEntity.calculateFinancials(
			input.items,
			input.type,
			input.creditAmountApplied
		);

		if (input.type === EBillType.PURCHASE) {
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
		} else {
			// REFUND
			if (input.creditAmountRefund === undefined)
				props.creditAmountRefund = calculated.creditAmountRefund;
			else if (input.creditAmountRefund !== calculated.creditAmountRefund) {
				throw new BillCreditRefundAmountMismatchException(
					input.creditAmountRefund,
					calculated.creditAmountRefund!
				);
			}

			// Default others to 0 for strict compliance if not provided
			if (props.totalAmount === undefined) props.totalAmount = 0;
			if (props.taxAmount === undefined) props.taxAmount = 0;
			if (props.finalAmount === undefined) props.finalAmount = 0;
		}

		return new BillEntity(props, id);
	}

	public static instantiate(id: string, props: BillProps): BillEntity {
		return new BillEntity(props, id);
	}

	private constructor(props: BillProps, id?: string) {
		super(props, id);
		this.validate();
	}

	public cancel(): void {
		if (this.props.status !== EBillStatus.PENDING) {
			throw new BillCannotCancelException(this.id, this.props.status);
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
		type: EBillType,
		creditAmountApplied: number
	) {
		if (type === EBillType.PURCHASE) {
			const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
			const taxAmount = items.reduce(
				(sum, item) => sum + (item.price * item.taxPercent) / 100,
				0
			);
			const finalAmount = totalAmount + taxAmount - creditAmountApplied;
			return { totalAmount, taxAmount, finalAmount, creditAmountRefund: undefined };
		} else {
			const creditAmountRefund = items.reduce(
				(sum, item) => sum + (item.creditRefundAmount || 0),
				0
			);
			return { totalAmount: 0, taxAmount: 0, finalAmount: 0, creditAmountRefund };
		}
	}

	private validate(): void {
		if (this.props.type === EBillType.PURCHASE) {
			if (this.props.creditAmountRefund !== undefined) {
				throw new BillCreditRefundAmountInvalidException(
					'Credit amount refund must be undefined for PURCHASE bill'
				);
			}
		} else if (this.props.type === EBillType.REFUND) {
			if (this.props.creditAmountRefund === undefined || this.props.creditAmountRefund <= 0) {
				throw new BillCreditRefundAmountInvalidException(
					'Credit amount refund must be defined and greater than 0 for REFUND bill'
				);
			}
		}
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

	get creditAmountApplied(): number {
		return this.props.creditAmountApplied;
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

	get creditAmountRefund(): number | undefined {
		return this.props.creditAmountRefund;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}
}
