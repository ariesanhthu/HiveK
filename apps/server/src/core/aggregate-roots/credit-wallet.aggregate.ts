import { BaseAggregateRoot } from '../common';
import { CreditBalanceVO } from '../value-objects';
import { InsufficientCreditException } from '../exceptions';
import { CreditToppedUpEvent, CreditDeductedEvent } from '../events';

export interface CreditWalletProps {
  enterpriseId: string;
  balances: CreditBalanceVO[];
  createdAt: Date;
  updatedAt: Date;
}

export class CreditWalletRoot extends BaseAggregateRoot<CreditWalletProps> {
  public static create(enterpriseId: string): CreditWalletRoot {
    const now = new Date();
    return new CreditWalletRoot({
      enterpriseId,
      balances: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  public static instantiate(
    id: string,
    props: CreditWalletProps,
  ): CreditWalletRoot {
    return new CreditWalletRoot(props, id);
  }

  private constructor(props: CreditWalletProps, id?: string) {
    super(props, id);
  }

  get enterpriseId(): string {
    return this.props.enterpriseId;
  }

  get balances(): CreditBalanceVO[] {
    return this.props.balances;
  }

  getAvailable(creditType: string): number {
    const bal = this.props.balances.find((b) => b.creditType === creditType);
    return bal ? bal.available : 0;
  }

  topUp(creditType: string, amount: number, reason: string): void {
    if (amount <= 0) return;
    const index = this.props.balances.findIndex(
      (b) => b.creditType === creditType,
    );
    const now = new Date();
    let newBalance = amount;

    if (index !== -1) {
      const existing = this.props.balances[index];
      newBalance = existing.total + amount;
      this.props.balances[index] = new CreditBalanceVO({
        creditType,
        total: newBalance,
        used: existing.used,
      });
    } else {
      this.props.balances.push(
        new CreditBalanceVO({
          creditType,
          total: amount,
          used: 0,
        }),
      );
    }
    this.props.updatedAt = now;

    this.addDomainEvent(
      new CreditToppedUpEvent(this.id || this.enterpriseId, {
        enterpriseId: this.enterpriseId,
        creditType,
        amount,
        newBalance,
        reason,
      }),
    );
  }

  deduct(creditType: string, amount: number, reason: string): void {
    if (amount <= 0) return;
    const index = this.props.balances.findIndex(
      (b) => b.creditType === creditType,
    );
    const available = index !== -1 ? this.props.balances[index].available : 0;

    if (available < amount) {
      throw new InsufficientCreditException(
        this.enterpriseId,
        creditType,
        amount,
        available,
      );
    }

    const existing = this.props.balances[index];
    const newUsed = existing.used + amount;
    this.props.balances[index] = new CreditBalanceVO({
      creditType,
      total: existing.total,
      used: newUsed,
    });
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new CreditDeductedEvent(this.id || this.enterpriseId, {
        enterpriseId: this.enterpriseId,
        creditType,
        amount,
        newBalance: existing.total - newUsed,
        reason,
      }),
    );
  }
}
