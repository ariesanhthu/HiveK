import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';
import { JsonObject, Nullable } from '@/core/types';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';
import { InvalidOperationException } from '@/core/exceptions';

export interface CampaignProps {
  ownerId: string;
  enterpriseId: Nullable<string>;
  budget: number;
  financialTarget: JsonObject;
  description: string;
  platformTarget: Array<{
    platformId: string;
    minFollowers?: number;
    maxFollowers?: number;
    note?: string;
    others?: JsonObject;
  }>;
  status: ECampaignStatus;
  collaboratorIds: string[];
  rawContents: Array<{
    fileId: string;
    rawContent?: string;
  }>;
  deleteAt: Nullable<Date>;
  deleteBy: Nullable<string>;
}

export type CampaignCreateProps = Omit<CampaignProps, 'deleteAt' | 'deleteBy' | 'status' | 'collaboratorIds'> & {
  status?: ECampaignStatus;
  collaboratorIds?: string[];
};

export class CampaignRoot extends BaseAggregateRoot<CampaignProps> {
  private constructor(props: CampaignProps, id?: string) {
    super(props, id);
  }

  public static create(props: CampaignCreateProps): CampaignRoot {
    const ownerId = props.ownerId;
    return new CampaignRoot({
      ...props,
      status: props.status || ECampaignStatus.DRAFT,
      collaboratorIds: props.collaboratorIds || [ownerId],
      deleteAt: null,
      deleteBy: null,
    });
  }

  public static instantiate(id: string, props: CampaignProps): CampaignRoot {
    return new CampaignRoot(props, id);
  }

  get ownerId(): string {
    return this.props.ownerId;
  }

  get enterpriseId(): Nullable<string> {
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

  get platformTarget() {
    return this.props.platformTarget;
  }

  get status(): ECampaignStatus {
    return this.props.status;
  }

  get collaboratorIds(): string[] {
    return this.props.collaboratorIds;
  }

  get rawContents() {
    return this.props.rawContents;
  }

  get deleteAt(): Nullable<Date> {
    return this.props.deleteAt;
  }

  get deleteBy(): Nullable<string> {
    return this.props.deleteBy;
  }

  public softDelete(deletedBy: string): void {
    if (this.props.status !== ECampaignStatus.DRAFT && this.props.status !== ECampaignStatus.CANCELLED) {
      throw new InvalidOperationException('Campaign can only be deleted in DRAFT or CANCELLED status');
    }
    this.props.deleteAt = new Date();
    this.props.deleteBy = deletedBy;
  }

  public restore(): void {
    this.props.deleteAt = null;
    this.props.deleteBy = null;
  }

  public update(props: Partial<CampaignProps>): void {
    if (this.props.status !== ECampaignStatus.DRAFT) {
      throw new InvalidOperationException('Campaign can only be updated in DRAFT status');
    }

    if (props.ownerId) this.props.ownerId = props.ownerId;
    if (props.enterpriseId !== undefined) this.props.enterpriseId = props.enterpriseId;
    if (props.budget !== undefined) this.props.budget = props.budget;
    if (props.financialTarget) this.props.financialTarget = props.financialTarget;
    if (props.description) this.props.description = props.description;
    if (props.platformTarget) this.props.platformTarget = props.platformTarget;
    if (props.rawContents) this.props.rawContents = props.rawContents;
  }

  public updateStatus(newStatus: ECampaignStatus): void {
    const current = this.props.status;

    if (newStatus === ECampaignStatus.CANCELLED) {
      if (current !== ECampaignStatus.DRAFT && current !== ECampaignStatus.FINDING_KOL) {
        throw new InvalidOperationException('Only campaigns in DRAFT or FINDING_KOL status can be cancelled');
      }
      this.props.status = newStatus;
      return;
    }

    // Normal transition: DRAFT --> FINDING_KOL --> IN_PROGRESS --> COMPLETED
    if (current === ECampaignStatus.DRAFT && newStatus === ECampaignStatus.FINDING_KOL) {
      this.props.status = newStatus;
      return;
    }

    if (current === ECampaignStatus.FINDING_KOL && newStatus === ECampaignStatus.IN_PROGRESS) {
      this.props.status = newStatus;
      return;
    }

    if (current === ECampaignStatus.IN_PROGRESS && newStatus === ECampaignStatus.COMPLETED) {
      this.props.status = newStatus;
      return;
    }

    throw new InvalidOperationException(`Invalid campaign status transition from ${current} to ${newStatus}`);
  }

  public inviteCollaborator(userId: string, requestedBy: string): void {
    if (requestedBy !== this.props.ownerId) {
      throw new InvalidOperationException('Only the campaign owner can invite collaborators');
    }
    if (this.props.collaboratorIds.includes(userId)) {
      throw new InvalidOperationException('User is already a collaborator in this campaign');
    }
    this.props.collaboratorIds.push(userId);
  }

  public revokeCollaborator(userId: string, requestedBy: string): void {
    if (requestedBy !== this.props.ownerId) {
      throw new InvalidOperationException('Only the campaign owner can revoke collaborators');
    }
    if (userId === this.props.ownerId) {
      throw new InvalidOperationException('Cannot revoke campaign owner from collaborators');
    }
    const index = this.props.collaboratorIds.indexOf(userId);
    if (index === -1) {
      throw new InvalidOperationException('User is not a collaborator in this campaign');
    }
    this.props.collaboratorIds.splice(index, 1);
  }
}
