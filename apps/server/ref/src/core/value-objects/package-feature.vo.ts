import { ValueObject } from '@/core/abstract';

export interface PackageFeatureProps {
	code: string;
	permissions: string[];
}

export class PackageFeatureVO extends ValueObject<PackageFeatureProps> {
	constructor(props: PackageFeatureProps) {
		super(props);
	}

	get code(): string {
		return this.props.code;
	}

	get permissions(): string[] {
		return this.props.permissions;
	}
}
