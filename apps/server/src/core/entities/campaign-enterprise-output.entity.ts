import { Nullable } from '@/core/types';
import { BaseEntity } from '../common/base.entity';
import { EOutputStatus, EOutputType } from '../enums';

export interface CampaignEnterpriseOutputProps {
  platformId: string;
  uniqueId?: string;
  outputType: EOutputType;
  title: string;
  isScheduleForPost: boolean;
  scheduledAt: Nullable<Date>;
  fileId: Nullable<string>;
  status: EOutputStatus;
  url: Nullable<string>;
  postedAt: Nullable<Date>;
  isTrackingActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CampaignEnterpriseOutputEntity extends BaseEntity<CampaignEnterpriseOutputProps> {
  private constructor(props: CampaignEnterpriseOutputProps, id?: string) {
    super(props, id);
  }

  public static create(
    props: Omit<CampaignEnterpriseOutputProps, 'createdAt' | 'updatedAt'>,
    id?: string,
  ): CampaignEnterpriseOutputEntity {
    const now = new Date();
    return new CampaignEnterpriseOutputEntity({
      ...props,
      createdAt: now,
      updatedAt: now,
    }, id);
  }

  public static instantiate(
    id: string,
    props: CampaignEnterpriseOutputProps,
  ): CampaignEnterpriseOutputEntity {
    return new CampaignEnterpriseOutputEntity(props, id);
  }

  get platformId(): string {
    return this.props.platformId;
  }
  get uniqueId(): string | undefined {
    return this.props.uniqueId;
  }
  get outputType(): EOutputType {
    return this.props.outputType;
  }
  get title(): string {
    return this.props.title;
  }
  get isScheduleForPost(): boolean {
    return this.props.isScheduleForPost;
  }
  get scheduledAt(): Nullable<Date> {
    return this.props.scheduledAt;
  }
  get fileId(): Nullable<string> {
    return this.props.fileId;
  }
  get status(): EOutputStatus {
    return this.props.status;
  }
  get url(): Nullable<string> {
    return this.props.url;
  }
  get postedAt(): Nullable<Date> {
    return this.props.postedAt;
  }
  get isTrackingActive(): boolean {
    return this.props.isTrackingActive;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public setFileId(fileId: Nullable<string>): void {
    this.props.fileId = fileId;
    this.props.updatedAt = new Date();
  }

  public publish(url: string, postedAt: Date = new Date()): void {
    this.props.status = EOutputStatus.PUBLISHED;
    this.props.url = url;
    this.props.postedAt = postedAt;
    this.props.isTrackingActive = true;
    this.props.updatedAt = new Date();
  }

  public updateTrackingStatus(isTrackingActive: boolean): void {
    this.props.isTrackingActive = isTrackingActive;
    this.props.updatedAt = new Date();
  }

  public update(
    props: Partial<Omit<CampaignEnterpriseOutputProps, 'createdAt' | 'updatedAt'>>,
  ): void {
    Object.assign(this.props, props);
    this.props.updatedAt = new Date();
  }
}
