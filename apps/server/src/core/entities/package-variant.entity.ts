import { BaseEntity } from '../common';
import { type GrantVO } from '../value-objects';
import { type ECurrency } from '../enums';

export interface PackageVariantProps {
  title: string;
  durationMonths: number | null;
  price: number;
  priceAfterDiscount: number;
  tax: number;
  currency: ECurrency;
  extraGrants: GrantVO[];
}

export type PackageVariantCreateProps = PackageVariantProps;

export class PackageVariantEntity extends BaseEntity<PackageVariantProps> {
  public static create(
    input: PackageVariantCreateProps,
    id?: string,
  ): PackageVariantEntity {
    return new PackageVariantEntity(input, id);
  }

  public static instantiate(
    id: string,
    props: PackageVariantProps,
  ): PackageVariantEntity {
    return new PackageVariantEntity(props, id);
  }

  private constructor(props: PackageVariantProps, id?: string) {
    super(props, id);
  }

  get title(): string {
    return this.props.title;
  }

  get durationMonths(): number | null {
    return this.props.durationMonths;
  }

  get price(): number {
    return this.props.price;
  }

  get priceAfterDiscount(): number {
    return this.props.priceAfterDiscount;
  }

  get tax(): number {
    return this.props.tax;
  }

  get currency(): ECurrency {
    return this.props.currency;
  }

  get extraGrants(): GrantVO[] {
    return this.props.extraGrants;
  }

  public update(
    props: Partial<{
      title: string;
      durationMonths: number | null;
      price: number;
      priceAfterDiscount: number;
      tax: number;
      currency: ECurrency;
      extraGrants: GrantVO[];
    }>,
  ): void {
    if (props.title !== undefined) this.props.title = props.title;
    if (props.durationMonths !== undefined)
      this.props.durationMonths = props.durationMonths;
    if (props.price !== undefined) this.props.price = props.price;
    if (props.priceAfterDiscount !== undefined)
      this.props.priceAfterDiscount = props.priceAfterDiscount;
    if (props.tax !== undefined) this.props.tax = props.tax;
    if (props.currency !== undefined) this.props.currency = props.currency;
    if (props.extraGrants !== undefined)
      this.props.extraGrants = props.extraGrants;
  }
}
