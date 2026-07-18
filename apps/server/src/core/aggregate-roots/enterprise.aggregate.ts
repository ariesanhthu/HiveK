import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';
import { Nullable, FileId } from '@/core/types';
import { PhoneNumberVO } from '@/core/value-objects/phone-number.value-object';
import { EntityHardDeletedEvent } from '../events/entity-hard-deleted.domain-event';
import { ETargetType, EEnterpriseMemberMode } from '../enums';
import { InvalidOperationException } from '../exceptions';

export interface EnterpriseMember {
  userId: string;
  mode: EEnterpriseMemberMode;
}

export interface EnterpriseKnowledgeBase {
  rawText?: string;
  externalLinks: string[];
  updatedAt: Date;
}

export interface EnterpriseProps {
  userId: string;
  companyName: string;
  description?: string;
  contactEmail: string;
  contactPhone?: PhoneNumberVO;
  website?: string;
  taxId?: string;
  logoUrlId?: FileId;
  isVerified: boolean;
  members: EnterpriseMember[];
  knowledgeBase?: EnterpriseKnowledgeBase;
  createdAt: Date;
  updatedAt: Date;
  deleteAt: Nullable<Date>;
  deleteBy: Nullable<string>;
}

export type EnterpriseCreateProps = Omit<EnterpriseProps, 'createdAt' | 'updatedAt' | 'deleteAt' | 'deleteBy' | 'members' | 'knowledgeBase'> & {
  members?: EnterpriseMember[];
  knowledgeBase?: EnterpriseKnowledgeBase;
};

export class EnterpriseRoot extends BaseAggregateRoot<EnterpriseProps> {
  private constructor(props: EnterpriseProps, id?: string) {
    super(props, id);
  }

  public static create(props: EnterpriseCreateProps): EnterpriseRoot {
    const now = new Date();
    return new EnterpriseRoot({
      ...props,
      members: props.members ?? [],
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

  get logoUrlId(): FileId | undefined {
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

  get members(): EnterpriseMember[] {
    return [...(this.props.members ?? [])];
  }

  get knowledgeBase(): EnterpriseKnowledgeBase | undefined {
    return this.props.knowledgeBase;
  }

  public isOwner(userId: string): boolean {
    return this.props.userId === userId;
  }

  public isSubOwner(userId: string): boolean {
    return this.props.members?.some(m => m.userId === userId && m.mode === EEnterpriseMemberMode.SUB_OWNER) ?? false;
  }

  public isMember(userId: string): boolean {
    return this.isOwner(userId) || (this.props.members?.some(m => m.userId === userId) ?? false);
  }

  public addMember(userId: string, mode: EEnterpriseMemberMode): void {
    if (this.props.userId === userId) {
      throw new InvalidOperationException('Owner is already a member');
    }
    if (this.props.members.some(m => m.userId === userId)) {
      return; // Already a member
    }
    this.props.members.push({ userId, mode });
    this.props.updatedAt = new Date();
  }

  public removeMember(userId: string): void {
    if (!this.props.members.some(m => m.userId === userId)) {
      return;
    }
    this.props.members = this.props.members.filter(m => m.userId !== userId);
    this.props.updatedAt = new Date();
  }

  public changeMemberMode(userId: string, mode: EEnterpriseMemberMode): void {
    const member = this.props.members.find(m => m.userId === userId);
    if (!member) {
      throw new InvalidOperationException('Member not found');
    }
    member.mode = mode;
    this.props.updatedAt = new Date();
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
    if (props.knowledgeBase !== undefined) {
      this.props.knowledgeBase = {
        ...props.knowledgeBase,
        updatedAt: new Date(),
      };
    }
    this.props.updatedAt = new Date();
  }

  public markForHardDelete(): void {
    this.addDomainEvent(new EntityHardDeletedEvent(
      this.id!,
      {
        entityId: this.id!,
        targetType: ETargetType.ENTERPRISE,
      }
    ));
  }
}
