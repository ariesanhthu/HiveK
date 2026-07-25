import { BaseValueObject } from '../common';

export interface CreditBalanceProps {
  creditType: string;
  total: number;
  used: number;
}

export class CreditBalanceVO extends BaseValueObject<CreditBalanceProps> {
  constructor(props: CreditBalanceProps) {
    super(props);
  }

  get creditType(): string {
    return this.props.creditType;
  }

  get total(): number {
    return this.props.total;
  }

  get used(): number {
    return this.props.used;
  }

  get available(): number {
    return this.props.total - this.props.used;
  }
}
