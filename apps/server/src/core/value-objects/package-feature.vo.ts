import { BaseValueObject } from '../common';

export interface PackageFeatureProps {
  code: string;
  permissions: string[];
}

export class PackageFeatureVO extends BaseValueObject<PackageFeatureProps> {
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
