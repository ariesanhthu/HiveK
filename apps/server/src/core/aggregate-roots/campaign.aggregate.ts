import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';
import { JsonObject, Nullable, FileId } from '@/core/types';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';
import { EParticipantStatus } from '@/core/enums';
import { InvalidOperationException } from '@/core/exceptions';
import { CampaignParticipantCreatedEvent } from '../events/campaign-participant-created.domain-event';
import { CampaignParticipantEntity } from '../entities';

function generateId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return timestamp + random;
}

export interface PlatformTargetItem {
  platformId: string;
  minFollowers?: number;
  maxFollowers?: number;
  note?: string;
  extras?: JsonObject;
}

export interface RawContentItem {
  fileId: FileId;
  rawContent?: string;
}

// @code-comment(SchedulePost): Kept for future reuse when schedule posts are inlined again.
// export interface SchedulePost {
//   scheduledTime: Date;
//   platformId: string;
//   status: ESchedulePostStatus;
//   campaignKOLOutputs: CampaignKOLOutputEntity[];
//   campaignEnterpriseOutputs: CampaignEnterpriseOutputEntity[];
//   createdAt?: Date;
//   updatedAt?: Date;
// }

export interface ScheduleDay {
  date: Date;
  label?: string;
  posts: string[];  // ScheduledPost IDs
}

export interface CampaignSchedule {
  timeline: ScheduleDay[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CampaignProps {
  ownerId: string;
  enterpriseId: string;
  budget: number;
  financialTarget: JsonObject;
  description: string;
  platformTarget: PlatformTargetItem[];
  extras?: JsonObject;
  status: ECampaignStatus;
  collaboratorIds: string[];
  rawContents: RawContentItem[];
  deleteAt: Nullable<Date>;
  deleteBy: Nullable<string>;
  createdAt: Date;
  updatedAt: Date;
  schedule?: CampaignSchedule;
  participants: CampaignParticipantEntity[];
}

export type CampaignCreateProps = Omit<CampaignProps, 'status' | 'collaboratorIds' | 'deleteAt' | 'deleteBy' | 'createdAt' | 'updatedAt' | 'participants'> & {
  financialTarget?: JsonObject;
};

export class CampaignRoot extends BaseAggregateRoot<CampaignProps> {
  private constructor(props: CampaignProps, id?: string) {
    super(props, id);
  }

  public static create(props: CampaignCreateProps): CampaignRoot {
    const now = new Date();
    return new CampaignRoot({
      ...props,
      financialTarget: props.financialTarget || {},
      status: ECampaignStatus.DRAFT,
      collaboratorIds: [],
      deleteAt: null,
      deleteBy: null,
      createdAt: now,
      updatedAt: now,
      participants: [],
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

  get extras(): JsonObject | undefined {
    return this.props.extras;
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

  get schedule(): CampaignSchedule | undefined {
    return this.props.schedule;
  }

  get participants(): CampaignParticipantEntity[] {
    return this.props.participants;
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
    // Invariant Guard: Check if any participant is in JOINED or COMPLETED status
    const hasActiveParticipants = this.props.participants.some(
      p => p.status === EParticipantStatus.JOINED || p.status === EParticipantStatus.COMPLETED
    );
    if (hasActiveParticipants) {
      throw new InvalidOperationException('Cannot delete campaign with joined or completed participants');
    }

    // @code-comment(SchedulePost): Output publishing guard disabled until schedule posts are re-inlined.
    // if (this.props.schedule?.timeline) {
    //   for (const day of this.props.schedule.timeline) {
    //     for (const post of day.posts) {
    //       const hasPublishedOutputs = post.campaignKOLOutputs.some(o => o.status === EOutputStatus.PUBLISHED) ||
    //         post.campaignEnterpriseOutputs.some(o => o.status === EOutputStatus.PUBLISHED);
    //       if (hasPublishedOutputs) {
    //         throw new InvalidOperationException('Cannot delete campaign with published outputs');
    //       }
    //     }
    //   }
    // }

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

  // Schedule management
  public updateSchedule(schedule: CampaignSchedule): void {
    this.props.schedule = schedule;
    this.props.updatedAt = new Date();
  }

  // Participant management
  public addParticipant(kolProfileId: string, kolEmail?: string): string {
    const existing = this.props.participants.find(p => p.kolProfileId === kolProfileId);
    if (existing) {
      throw new InvalidOperationException('KOL is already a participant of this campaign');
    }

    const now = new Date();
    const participantId = generateId();

    const participant = CampaignParticipantEntity.create({
      kolProfileId,
      status: EParticipantStatus.PENDING_APPROVAL,
      joinedAt: null,
    }, participantId);

    this.props.participants.push(participant);
    this.props.updatedAt = now;

    this.addDomainEvent(
      new CampaignParticipantCreatedEvent(participantId, {
        campaignParticipantId: participantId,
        campaignId: this.id!,
        kolProfileId,
        kolEmail,
        campaignName: this.props.description,
      })
    );

    return participantId;
  }

  public joinParticipant(kolProfileId: string): void {
    const p = this.props.participants.find(x => x.kolProfileId === kolProfileId);
    if (!p) {
      throw new InvalidOperationException('Participant not found');
    }
    if (p.status !== EParticipantStatus.PENDING_APPROVAL) {
      throw new InvalidOperationException('Can only join when status is PENDING_APPROVAL');
    }
    p.join();
    this.props.updatedAt = new Date();
  }

  public rejectParticipant(kolProfileId: string): void {
    const p = this.props.participants.find(x => x.kolProfileId === kolProfileId);
    if (!p) {
      throw new InvalidOperationException('Participant not found');
    }
    if (p.status !== EParticipantStatus.PENDING_APPROVAL && p.status !== EParticipantStatus.JOINED) {
      throw new InvalidOperationException('Can only reject when status is PENDING_APPROVAL or JOINED');
    }

    // @code-comment(SchedulePost): Participant rejection output guard disabled.
    // if (this.props.schedule?.timeline) {
    //   for (const day of this.props.schedule.timeline) {
    //     for (const post of day.posts) {
    //       const published = post.campaignKOLOutputs.some(
    //         o => o.campaignParticipantId === p.id && o.status === EOutputStatus.PUBLISHED
    //       );
    //       if (published) {
    //         throw new InvalidOperationException('Cannot reject participant with published outputs');
    //       }
    //     }
    //   }
    // }

    p.reject();
    this.props.updatedAt = new Date();
  }

  public completeParticipant(kolProfileId: string): void {
    const p = this.props.participants.find(x => x.kolProfileId === kolProfileId);
    if (!p) {
      throw new InvalidOperationException('Participant not found');
    }
    if (p.status !== EParticipantStatus.JOINED) {
      throw new InvalidOperationException('Can only complete when status is JOINED');
    }
    p.complete();
    this.props.updatedAt = new Date();
  }

  public removeParticipant(participantId: string): void {
    const idx = this.props.participants.findIndex(p => p.id === participantId);
    if (idx === -1) {
      throw new InvalidOperationException('Participant not found');
    }
    const p = this.props.participants[idx];
    if (p.status !== EParticipantStatus.REJECTED) {
      throw new InvalidOperationException('Can only remove participant when status is REJECTED');
    }
    this.props.participants.splice(idx, 1);
    this.props.updatedAt = new Date();
  }

  public restoreParticipant(participantId: string): void {
    const p = this.props.participants.find(x => x.id === participantId);
    if (!p) {
      throw new InvalidOperationException('Participant not found');
    }
    p.restore();
    this.props.updatedAt = new Date();
  }

  public softDeleteParticipant(participantId: string, deletedBy: string): void {
    const p = this.props.participants.find(x => x.id === participantId);
    if (!p) {
      throw new InvalidOperationException('Participant not found');
    }
    p.softDelete(deletedBy);
    this.props.updatedAt = new Date();
  }

  // @code-comment(SchedulePost): setOutputFileId, publishOutput, updateTrackingStatus, updateKOLOutputs
  // are disabled until schedule posts are re-inlined (posts field is now string[] of ScheduledPost IDs).
  // public setOutputFileId(outputId: string, fileId: string): void { ... }
  // public publishOutput(outputId: string, url: string): void { ... }
  // public updateTrackingStatus(outputId: string, isTrackingActive: boolean): void { ... }
  // public updateKOLOutputs(campaignParticipantId: string, outputs: CampaignKOLOutputEntity[]): void { ... }
}
