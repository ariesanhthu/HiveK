import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';
import { JsonObject, Nullable } from '@/core/types';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';
import { InvalidOperationException } from '@/core/exceptions';

export interface PlatformTargetItem {
  platformId: string;
  minFollowers?: number;
  maxFollowers?: number;
  note?: string;
  others?: JsonObject;
}

export interface RawContentItem {
  fileId: string;
  rawContent?: string;
}

export interface CampaignProps {
  ownerId: string;
  enterpriseId: string; // Now mandatory
  budget: number;
  financialTarget: JsonObject;
  description: string;
  platformTarget: PlatformTargetItem[];
  status: ECampaignStatus;
  collaboratorIds: string[];
  rawContents: RawContentItem[];
  deleteAt: Nullable<Date>;
  deleteBy: Nullable<string>;
  createdAt: Date;
  updatedAt: Date;
}

export type CampaignCreateProps = Omit<CampaignProps, 'status' | 'collaboratorIds' | 'deleteAt' | 'deleteBy' | 'createdAt' | 'updatedAt'>;

export class CampaignRoot extends BaseAggregateRoot<CampaignProps> {
  private constructor(props: CampaignProps, id?: string) {
    super(props, id);
  }

  public static create(props: CampaignCreateProps): CampaignRoot {
    const now = new Date();
    return new CampaignRoot({
      ...props,
      status: ECampaignStatus.DRAFT,
      collaboratorIds: [],
      deleteAt: null,
      deleteBy: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static instantiate(id: string, props: CampaignProps): CampaignRoot {
    return new CampaignRoot(props, id);
  }

  get ownerId(): string {
    return this.props.ownerId;
  }

  get enterpriseId(): string {
    return this.props.enterpriseId;
  }

  get budget(): number {
    return this.props.budget;
  }

  get financialTarget(): JsonObject {
    return this.props.financialTarget;
  }

  get description(): string {
    return this.props.description;
  }

  get platformTarget(): PlatformTargetItem[] {
    return this.props.platformTarget;
  }

  get status(): ECampaignStatus {
    return this.props.status;
  }

  get collaboratorIds(): string[] {
    return [...this.props.collaboratorIds];
  }

  get rawContents(): RawContentItem[] {
    return [...this.props.rawContents];
  }

  get deleteAt(): Nullable<Date> {
    return this.props.deleteAt;
  }

  get deleteBy(): Nullable<string> {
    return this.props.deleteBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public update(props: Partial<Omit<CampaignProps, 'status' | 'collaboratorIds' | 'createdAt' | 'updatedAt'>>): void {
    Object.assign(this.props, props);
    this.props.updatedAt = new Date();
  }

  public updateStatus(status: ECampaignStatus): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  public softDelete(deletedBy: string): void {
    this.props.deleteAt = new Date();
    this.props.deleteBy = deletedBy;
    this.props.updatedAt = new Date();
  }

  public restore(): void {
    this.props.deleteAt = null;
    this.props.deleteBy = null;
    this.props.updatedAt = new Date();
  }

  public inviteCollaborator(userId: string, requestedBy: string): void {
    if (this.props.ownerId !== requestedBy) {
      throw new InvalidOperationException('Only campaign owner can invite collaborators');
    }
    if (this.props.collaboratorIds.includes(userId)) {
      throw new InvalidOperationException('User is already a collaborator');
    }
    if (this.props.ownerId === userId) {
      throw new InvalidOperationException('Owner cannot be invited as a collaborator');
    }
    this.props.collaboratorIds.push(userId);
    this.props.updatedAt = new Date();
  }

  public revokeCollaborator(userId: string, requestedBy: string): void {
    if (this.props.ownerId !== requestedBy) {
      throw new InvalidOperationException('Only campaign owner can revoke collaborators');
    }
    const index = this.props.collaboratorIds.indexOf(userId);
    if (index === -1) {
      throw new InvalidOperationException('User is not a collaborator in this campaign');
    }
    this.props.collaboratorIds.splice(index, 1);
    this.props.updatedAt = new Date();
  }
}
