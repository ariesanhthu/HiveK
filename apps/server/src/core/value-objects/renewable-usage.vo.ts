import { BaseValueObject } from '../common';

export interface RenewableUsageProps {
  key: string;
  allocated: number;
  used: number;
  cycleStartAt: Date;
  cycleEndsAt: Date;
}

export class RenewableUsageVO extends BaseValueObject<RenewableUsageProps> {
  constructor(props: RenewableUsageProps) {
    super(props);
  }

  get key(): string {
    return this.props.key;
  }

  get allocated(): number {
    return this.props.allocated;
  }

  get used(): number {
    return this.props.used;
  }

  get cycleStartAt(): Date {
    return this.props.cycleStartAt;
  }

  get cycleEndsAt(): Date {
    return this.props.cycleEndsAt;
  }
}
