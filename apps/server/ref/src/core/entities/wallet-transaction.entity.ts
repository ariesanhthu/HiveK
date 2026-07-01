import { Entity } from '@/core/abstract';
import { type Optional } from '@/core/types';
import { type EWalletTransactionType } from '../enums';
import type { JsonRecord } from '@/shared/types';
import { type MoneyVO } from '../value-objects';

export interface WalletTransactionProps {
	walletId: string;
	type: EWalletTransactionType;
	amount: MoneyVO;
	billId: Optional<string>;
	idempotencyKey: string;
	description: string;
	metadata: Optional<JsonRecord>;
	createdAt: Date;
}

export type WalletTransactionCreateProps = Omit<
	WalletTransactionProps,
	| 'billId'
	| 'metadata'
	| 'createdAt'
> & {
	billId?: Optional<string>;
	metadata?: Optional<JsonRecord>;
	createdAt?: Date;
};

export class WalletTransactionEntity extends Entity<WalletTransactionProps> {
	public static create(input: WalletTransactionCreateProps, id?: string): WalletTransactionEntity {
		const now = new Date();
		return new WalletTransactionEntity({
			...input,
			billId: input.billId,
			metadata: input.metadata,
			createdAt: input.createdAt ?? now,
		}, id);
	}

	public static instantiate(id: string, props: WalletTransactionProps): WalletTransactionEntity {
		return new WalletTransactionEntity(props, id);
	}

	private constructor(props: WalletTransactionProps, id?: string) {
		super(props, id);
	}

	get walletId(): string {
		return this.props.walletId;
	}

	get type(): EWalletTransactionType {
		return this.props.type;
	}

	get amount(): MoneyVO {
		return this.props.amount;
	}

	get billId(): Optional<string> {
		return this.props.billId;
	}

	get idempotencyKey(): string {
		return this.props.idempotencyKey;
	}

	get description(): string {
		return this.props.description;
	}

	get metadata(): Optional<JsonRecord> {
		return this.props.metadata;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	isIdempotent(key: string): boolean {
		return this.props.idempotencyKey === key;
	}
}
