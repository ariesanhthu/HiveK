import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';
import { Optional } from '@core/types';
import { Nullable } from '@/core/types';

export interface EnterpriseProps {
  userId: string;
  companyName: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  taxId?: string;
  logoUrl?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  deleteAt: Nullable<Date>;
  deleteBy: Nullable<string>;
}

export type EnterpriseCreateProps = Omit<EnterpriseProps, 'createdAt' | 'updatedAt' | 'deleteAt' | 'deleteBy'>;

export class EnterpriseRoot extends BaseAggregateRoot<EnterpriseProps> {
  private constructor(props: EnterpriseProps, id?: string) {
    super(props, id);
  }

  public static create(props: EnterpriseCreateProps): EnterpriseRoot {
    const now = new Date();
    return new EnterpriseRoot({
      ...props,
      createdAt: now,
      updatedAt: now,
      deleteAt: null,
      deleteBy: null,
    });
  }

  public static instantiate(id: string, props: EnterpriseProps): EnterpriseRoot {
    return new EnterpriseRoot(props, id);
  }

  get userId(): string {
    return this.props.userId;
  }

  get companyName(): string {
    return this.props.companyName;
  }

  get description(): string {
    return this.props.description;
  }

  get contactEmail(): string {
    return this.props.contactEmail;
  }

  get contactPhone(): string {
    return this.props.contactPhone;
  }

  get website(): Optional<string> {
    return this.props.website;
  }

  get taxId(): Optional<string> {
    return this.props.taxId;
  }

  get logoUrl(): Optional<string> {
    return this.props.logoUrl;
  }

  get isVerified(): boolean {
    return this.props.isVerified;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get deleteAt(): Nullable<Date> {
    return this.props.deleteAt;
  }

  get deleteBy(): Nullable<string> {
    return this.props.deleteBy;
  }

  public softDelete(deletedBy: string): void {
    this.props.deleteAt = new Date();
    this.props.deleteBy = deletedBy;
  }

  public restore(): void {
    this.props.deleteAt = null;
    this.props.deleteBy = null;
  }
}
