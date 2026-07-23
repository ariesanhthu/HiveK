import { BaseEntity } from '../common/base.entity';
import { EParticipantStatus } from '../enums';
import { Nullable } from '../types';

export interface CampaignParticipantProps {
  kolProfileId: string;
  status: EParticipantStatus;
  joinedAt: Nullable<Date>;
  deleteAt: Nullable<Date>;
  deleteBy: Nullable<string>;
  createdAt: Date;
  updatedAt: Date;
}

export class CampaignParticipantEntity extends BaseEntity<CampaignParticipantProps> {
  private constructor(props: CampaignParticipantProps, id?: string) {
    super(props, id);
  }

  public static create(
    props: Omit<CampaignParticipantProps, 'createdAt' | 'updatedAt' | 'deleteAt' | 'deleteBy'>,
    id?: string,
  ): CampaignParticipantEntity {
    const now = new Date();
    return new CampaignParticipantEntity({
      ...props,
      deleteAt: null,
      deleteBy: null,
      createdAt: now,
      updatedAt: now,
    }, id);
  }

  public static instantiate(
    id: string,
    props: CampaignParticipantProps,
  ): CampaignParticipantEntity {
    return new CampaignParticipantEntity(props, id);
  }

  get kolProfileId(): string {
    return this.props.kolProfileId;
  }

  get status(): EParticipantStatus {
    return this.props.status;
  }

  get joinedAt(): Nullable<Date> {
    return this.props.joinedAt;
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

  public join(joinedAt: Date = new Date()): void {
    this.props.status = EParticipantStatus.JOINED;
    this.props.joinedAt = joinedAt;
    this.props.updatedAt = new Date();
  }

  public reject(): void {
    this.props.status = EParticipantStatus.REJECTED;
    this.props.updatedAt = new Date();
  }

  public complete(): void {
    this.props.status = EParticipantStatus.COMPLETED;
    this.props.updatedAt = new Date();
  }

  public updateStatus(status: EParticipantStatus, joinedAt?: Nullable<Date>): void {
    this.props.status = status;
    if (joinedAt !== undefined) {
      this.props.joinedAt = joinedAt;
    }
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
}
