import { ValueObject } from '@/core/abstract';
import { type ECurrency } from '@/core/enums';

export class MoneyVO extends ValueObject<{ amount: number; currency: ECurrency }> {
	constructor(amount: number, currency: ECurrency) {
		if (amount < 0) {
			throw new Error('Amount cannot be negative');
		}
		super({ amount, currency });
	}

	get amount(): number {
		return this.props.amount;
	}

	get currency(): ECurrency {
		return this.props.currency;
	}

	public add(other: MoneyVO): MoneyVO {
		this.assertSameCurrency(other);
		return new MoneyVO(this.amount + other.amount, this.currency);
	}

	public subtract(other: MoneyVO): MoneyVO {
		this.assertSameCurrency(other);
		return new MoneyVO(this.amount - other.amount, this.currency);
	}

	public multiply(factor: number): MoneyVO {
		return new MoneyVO(this.amount * factor, this.currency);
	}

	public equals(other?: MoneyVO): boolean {
		if (!other) return false;
		return this.amount === other.amount && this.currency === other.currency;
	}

	public greaterThan(other: MoneyVO): boolean {
		this.assertSameCurrency(other);
		return this.amount > other.amount;
	}

	public lessThan(other: MoneyVO): boolean {
		this.assertSameCurrency(other);
		return this.amount < other.amount;
	}

	public isZero(): boolean {
		return this.amount === 0;
	}

	public isPositive(): boolean {
		return this.amount > 0;
	}

	private assertSameCurrency(other: MoneyVO): void {
		if (this.currency !== other.currency) {
			throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
		}
	}

	public static zero(currency: ECurrency): MoneyVO {
		return new MoneyVO(0, currency);
	}
}
