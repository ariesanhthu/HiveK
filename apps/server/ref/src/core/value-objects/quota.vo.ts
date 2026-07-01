import { ValueObject } from '@/core/abstract';

export interface QuotaProps {
	maxUsers?: number;
	storageGb?: number;
	[key: string]: number | undefined;
}

export class QuotaVO extends ValueObject<QuotaProps> {
	constructor(props: QuotaProps) {
		super(props);
	}

	get maxUsers(): number | undefined {
		return this.props.maxUsers;
	}

	get storageGb(): number | undefined {
		return this.props.storageGb;
	}

	get unmarshal(): QuotaProps {
		return { ...this.props };
	}

	getValue(key: string): number | undefined {
		return this.props[key];
	}
}
