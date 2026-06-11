import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';
import { Nullable } from '@/core/types';
import { PhoneNumberVO } from '@/core/value-objects/phone-number.value-object';
import { EntityHardDeletedEvent } from '../events/entity-hard-deleted.domain-event';
import { TargetType } from '../enums';

export interface EnterpriseProps {
  userId: string;
  companyName: string;
  description?: string;
  contactEmail: string;
  contactPhone?: PhoneNumberVO;
  website?: string;
  taxId?: string;
  logoUrlId?: string;
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

  get description(): string | undefined {
    return this.props.description;
  }

  get contactEmail(): string {
    return this.props.contactEmail;
  }

  get contactPhone(): PhoneNumberVO | undefined {
    return this.props.contactPhone;
  }

  get website(): string | undefined {
    return this.props.website;
  }

  get taxId(): string | undefined {
    return this.props.taxId;
  }

  get logoUrlId(): string | undefined {
    return this.props.logoUrlId;
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

  public update(props: Partial<EnterpriseProps>): void {
    if (props.companyName !== undefined) this.props.companyName = props.companyName;
    if (props.description !== undefined) this.props.description = props.description;
    if (props.contactEmail !== undefined) this.props.contactEmail = props.contactEmail;
    if (props.contactPhone !== undefined) this.props.contactPhone = props.contactPhone;
    if (props.website !== undefined) this.props.website = props.website;
    if (props.taxId !== undefined) this.props.taxId = props.taxId;
    if (props.logoUrlId !== undefined) this.props.logoUrlId = props.logoUrlId;
    if (props.isVerified !== undefined) this.props.isVerified = props.isVerified;
    this.props.updatedAt = new Date();
  }

  public markForHardDelete(): void {
    this.addDomainEvent(new EntityHardDeletedEvent(
      this.id!,
      {
        entityId: this.id!,
        targetType: TargetType.ENTERPRISE,
      }
    ));
  }
}
