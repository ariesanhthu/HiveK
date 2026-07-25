import { BaseValueObject } from '../common';
import { EGrantType } from '../enums';

export interface GrantProps {
  type: EGrantType;
  key: string;
  value: number;
  resetCycle?: 'monthly' | 'weekly' | 'daily';
  creditFallback?: {
    creditType: string;
    creditsPerUnit: number;
  } | null;
}

export class GrantVO extends BaseValueObject<GrantProps> {
  constructor(props: GrantProps) {
    super(props);
  }

  get type(): EGrantType {
    return this.props.type;
  }

  get key(): string {
    return this.props.key;
  }

  get value(): number {
    return this.props.value;
  }

  get resetCycle(): 'monthly' | 'weekly' | 'daily' | undefined {
    return this.props.resetCycle;
  }

  get creditFallback(): GrantProps['creditFallback'] {
    return this.props.creditFallback;
  }
}
