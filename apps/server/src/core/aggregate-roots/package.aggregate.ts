import { BaseAggregateRoot } from '../common';
import { type Optional, type Nullable } from '../types';
import { EVersionStatus, type EPackageType, type EPackageScope } from '../enums';
import { type PackageFeatureVO, type QuotaVO } from '../value-objects';
import { type PackageVariantEntity } from '../entities/package-variant.entity';

export interface PackageProps {
  code: string;
  name: string;
  description: string;
  type: EPackageType;
  scope: EPackageScope;
  enterpriseId: Nullable<string>;
  status: EVersionStatus;
  features: PackageFeatureVO[];
  baseQuotas: QuotaVO;
  variants: PackageVariantEntity[];
  createdAt: Date;
  updatedAt: Date;
  activatedAt: Optional<Date>;
}

export type PackageCreateProps = Omit<
  PackageProps,
  'status' | 'variants' | 'createdAt' | 'updatedAt' | 'activatedAt'
> & {
  status?: EVersionStatus;
  variants?: PackageVariantEntity[];
  createdAt?: Date;
  updatedAt?: Date;
  activatedAt?: Date;
};

export class PackageEntity extends BaseAggregateRoot<PackageProps> {
  public static create(input: PackageCreateProps, id?: string): PackageEntity {
    const now = new Date();
    return new PackageEntity(
      {
        code: input.code,
        name: input.name,
        description: input.description,
        type: input.type,
        scope: input.scope,
        enterpriseId: input.enterpriseId,
        status: input.status ?? EVersionStatus.DRAFT,
        features: input.features,
        baseQuotas: input.baseQuotas,
        variants: input.variants ?? [],
        createdAt: input.createdAt ?? now,
        updatedAt: input.updatedAt ?? now,
        activatedAt: input.activatedAt,
      },
      id
    );
  }

  public static instantiate(id: string, props: PackageProps): PackageEntity {
    return new PackageEntity(props, id);
  }

  private constructor(props: PackageProps, id?: string) {
    super(props, id);
  }

  get code(): string {
    return this.props.code;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get type(): EPackageType {
    return this.props.type;
  }

  get scope(): EPackageScope {
    return this.props.scope;
  }

  get enterpriseId(): Nullable<string> {
    return this.props.enterpriseId;
  }

  get status(): EVersionStatus {
    return this.props.status;
  }

  get features(): PackageFeatureVO[] {
    return this.props.features;
  }

  get baseQuotas(): QuotaVO {
    return this.props.baseQuotas;
  }

  get variants(): PackageVariantEntity[] {
    return this.props.variants;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get activatedAt(): Optional<Date> {
    return this.props.activatedAt;
  }

  public activate(): void {
    this.props.status = EVersionStatus.ACTIVE;
    this.props.activatedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public archive(): void {
    this.props.status = EVersionStatus.ARCHIVED;
    this.props.updatedAt = new Date();
  }

  public updateGeneralInfo(
    props: Partial<{
      name: string;
      description: string;
      type: EPackageType;
      scope: EPackageScope;
      features: PackageFeatureVO[];
      baseQuotas: QuotaVO;
    }>
  ): void {
    if (props.name !== undefined) this.props.name = props.name;
    if (props.description !== undefined) this.props.description = props.description;
    if (props.type !== undefined) this.props.type = props.type;
    if (props.scope !== undefined) this.props.scope = props.scope;
    if (props.features !== undefined) this.props.features = props.features;
    if (props.baseQuotas !== undefined) this.props.baseQuotas = props.baseQuotas;
    this.props.updatedAt = new Date();
  }

  public removeVariant(variantId: string): void {
    const index = this.props.variants.findIndex((v) => v.id === variantId);
    if (index !== -1) {
      this.props.variants.splice(index, 1);
      this.props.updatedAt = new Date();
    }
  }
}
