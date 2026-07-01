import { ValueObject } from '@/core/abstract';
import { type QuotaVO } from './quota.vo';

export interface SubscriptionChangeDetailsProps {
	oldPackages: string[];
	newPackages: string[];
	oldQuotas: QuotaVO;
	newQuotas: QuotaVO;
	oldPermissions: string[];
	newPermissions: string[];
}

export class SubscriptionChangeDetailsVO extends ValueObject<SubscriptionChangeDetailsProps> {
	constructor(props: SubscriptionChangeDetailsProps) {
		super(props);
	}

	get oldPackages(): string[] {
		return this.props.oldPackages;
	}

	get newPackages(): string[] {
		return this.props.newPackages;
	}

	get oldQuotas(): QuotaVO {
		return this.props.oldQuotas;
	}

	get newQuotas(): QuotaVO {
		return this.props.newQuotas;
	}

	get oldPermissions(): string[] {
		return this.props.oldPermissions;
	}

	get newPermissions(): string[] {
		return this.props.newPermissions;
	}

	// Computed diffs
	getAddedPackages(): string[] {
		return this.props.newPackages.filter((p) => !this.props.oldPackages.includes(p));
	}

	getRemovedPackages(): string[] {
		return this.props.oldPackages.filter((p) => !this.props.newPackages.includes(p));
	}

	getAddedPermissions(): string[] {
		return this.props.newPermissions.filter((p) => !this.props.oldPermissions.includes(p));
	}

	getRemovedPermissions(): string[] {
		return this.props.oldPermissions.filter((p) => !this.props.newPermissions.includes(p));
	}
}
