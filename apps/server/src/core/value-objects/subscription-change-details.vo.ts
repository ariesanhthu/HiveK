import { BaseValueObject } from '../common';
import { GrantVO } from './grant.vo';

export interface SubscriptionChangeDetailsProps {
  oldPlanId: string | null;
  newPlanId: string | null;
  addedAddonIds: string[];
  removedAddonIds: string[];
  oldGrants: GrantVO[];
  newGrants: GrantVO[];
  oldPermissions: string[];
  newPermissions: string[];
}

export class SubscriptionChangeDetailsVO extends BaseValueObject<SubscriptionChangeDetailsProps> {
  constructor(props: SubscriptionChangeDetailsProps) {
    super(props);
  }

  get oldPlanId(): string | null {
    return this.props.oldPlanId;
  }

  get newPlanId(): string | null {
    return this.props.newPlanId;
  }

  get addedAddonIds(): string[] {
    return this.props.addedAddonIds;
  }

  get removedAddonIds(): string[] {
    return this.props.removedAddonIds;
  }

  get oldGrants(): GrantVO[] {
    return this.props.oldGrants;
  }

  get newGrants(): GrantVO[] {
    return this.props.newGrants;
  }

  get oldPermissions(): string[] {
    return this.props.oldPermissions;
  }

  get newPermissions(): string[] {
    return this.props.newPermissions;
  }

  getAddedPermissions(): string[] {
    return this.props.newPermissions.filter((p) => !this.props.oldPermissions.includes(p));
  }

  getRemovedPermissions(): string[] {
    return this.props.oldPermissions.filter((p) => !this.props.newPermissions.includes(p));
  }
}
