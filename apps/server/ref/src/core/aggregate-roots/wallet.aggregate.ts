import { AggregateRoot } from '../abstract';
import { MoneyVO } from '../value-objects';

export interface WalletProps {
	enterpriseId: string;
	balance: MoneyVO;
	createdAt: Date;
	updatedAt: Date;
}

export type WalletCreateProps = Omit<WalletProps, 'createdAt' | 'updatedAt'> & {
	createdAt?: Date;
	updatedAt?: Date;
};

export class WalletEntity extends AggregateRoot<WalletProps> {
	public static create(input: WalletCreateProps, id?: string): WalletEntity {
		const now = new Date();
		return new WalletEntity(
			{
				enterpriseId: input.enterpriseId,
				balance: input.balance,
				createdAt: input.createdAt ?? now,
				updatedAt: input.updatedAt ?? now,
			},
			id
		);
	}

	public static instantiate(id: string, props: WalletProps): WalletEntity {
		return new WalletEntity(props, id);
	}

	private constructor(props: WalletProps, id?: string) {
		super(props, id);
	}

	get enterpriseId(): string {
		return this.props.enterpriseId;
	}

	get balance(): MoneyVO {
		return this.props.balance;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get updatedAt(): Date {
		return this.props.updatedAt;
	}

	canDebit(amount: MoneyVO): boolean {
		if (this.props.balance.currency !== amount.currency) {
			throw new Error('Currency mismatch');
		}
		return this.props.balance.amount >= amount.amount;
	}

	debit(amount: MoneyVO): void {
		if (!this.canDebit(amount)) {
			throw new Error('Insufficient balance');
		}
		this.props.balance = new MoneyVO(
			this.props.balance.amount - amount.amount,
			this.props.balance.currency
		);
		this.props.updatedAt = new Date();
	}

	credit(amount: MoneyVO): void {
		if (this.props.balance.currency !== amount.currency) {
			throw new Error('Currency mismatch');
		}
		this.props.balance = new MoneyVO(
			this.props.balance.amount + amount.amount,
			this.props.balance.currency
		);
		this.props.updatedAt = new Date();
	}
}
