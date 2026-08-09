import { BaseValueObject } from '../common';
import { EGrantType } from '../enums';

export interface EnterpriseQuotaAllocationProps {
  ownerId: string;
  enterpriseId: string;
  key: string;
  allocated: number;
  kind: EGrantType;
  isPool: boolean;
}

export class EnterpriseQuotaAllocationVO extends BaseValueObject<EnterpriseQuotaAllocationProps> {
  constructor(props: EnterpriseQuotaAllocationProps) {
    super(props);
  }

  get ownerId(): string {
    return this.props.ownerId;
  }

  get enterpriseId(): string {
    return this.props.enterpriseId;
  }

  get key(): string {
    return this.props.key;
  }

  get allocated(): number {
    return this.props.allocated;
  }

  get kind(): EGrantType {
    return this.props.kind;
  }

  get isPool(): boolean {
    return this.props.isPool;
  }
}
