import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';
import { Nullable } from '@/core/types';
import { EParticipantStatus, EOutputStatus, EOutputType } from '../enums';
import { InvalidOperationException } from '../exceptions/general.exception';

export interface CampaignOutput {
  id: string; // uuid
  platformId: string;
  outputType: EOutputType;
  title: string;
  isScheduleForPost: boolean;
  fileId: Nullable<string>;
  scheduledAt: Nullable<Date>;
  status: EOutputStatus;
  url: Nullable<string>;
  postedAt: Nullable<Date>;
}

export interface CampaignParticipantProps {
  campaignId: string;
  kolProfileId: string;
  status: EParticipantStatus;
  joinedAt: Nullable<Date>;
  createdAt: Date;
  updatedAt: Date;
  outputs: CampaignOutput[];
  deleteAt: Nullable<Date>;
  deleteBy: Nullable<string>;
}

export type CampaignParticipantCreateProps = Omit<
  CampaignParticipantProps,
  'createdAt' | 'updatedAt' | 'joinedAt' | 'status' | 'outputs' | 'deleteAt' | 'deleteBy'
>;

export class CampaignParticipantRoot extends BaseAggregateRoot<CampaignParticipantProps> {
  private constructor(props: CampaignParticipantProps, id?: string) {
    super(props, id);
  }

  public static create(props: CampaignParticipantCreateProps): CampaignParticipantRoot {
    const now = new Date();
    return new CampaignParticipantRoot({
      ...props,
      status: EParticipantStatus.PENDING_APPROVAL,
      joinedAt: null,
      createdAt: now,
      updatedAt: now,
      outputs: [],
      deleteAt: null,
      deleteBy: null,
    });
  }

  public static instantiate(id: string, props: CampaignParticipantProps): CampaignParticipantRoot {
    return new CampaignParticipantRoot(props, id);
  }

  get campaignId(): string {
    return this.props.campaignId;
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

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get outputs(): CampaignOutput[] {
    return this.props.outputs;
  }

  get deleteAt(): Nullable<Date> {
    return this.props.deleteAt;
  }

  get deleteBy(): Nullable<string> {
    return this.props.deleteBy;
  }

  public join(): void {
    if (this.props.status !== EParticipantStatus.PENDING_APPROVAL) {
      throw new InvalidOperationException('Can only join when status is PENDING_APPROVAL');
    }
    this.props.status = EParticipantStatus.JOINED;
    this.props.joinedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public reject(): void {
    if (
      this.props.status !== EParticipantStatus.PENDING_APPROVAL &&
      this.props.status !== EParticipantStatus.JOINED
    ) {
      throw new InvalidOperationException('Can only reject when status is PENDING_APPROVAL or JOINED');
    }
    this.props.status = EParticipantStatus.REJECTED;
    this.props.updatedAt = new Date();
  }

  public complete(): void {
    if (this.props.status !== EParticipantStatus.JOINED) {
      throw new InvalidOperationException('Can only complete when status is JOINED');
    }
    this.props.status = EParticipantStatus.COMPLETED;
    this.props.updatedAt = new Date();
  }

  public addOutput(
    output: Omit<CampaignOutput, 'status' | 'url' | 'postedAt'> & {
      status?: EOutputStatus;
      url?: Nullable<string>;
      postedAt?: Nullable<Date>;
    },
  ): void {
    const status = output.isScheduleForPost
      ? output.status || EOutputStatus.SCHEDULED
      : EOutputStatus.PUBLISHED;

    const url = output.isScheduleForPost ? null : output.url || null;
    const postedAt = output.isScheduleForPost ? null : output.postedAt || new Date();

    if (!output.isScheduleForPost && !url) {
      throw new InvalidOperationException('Published output requires a URL');
    }

    this.props.outputs.push({
      ...output,
      status,
      url,
      postedAt,
    });
    this.props.updatedAt = new Date();
  }

  public publishOutput(outputId: string, url: string): void {
    const output = this.props.outputs.find((o) => o.id === outputId);
    if (!output) {
      throw new InvalidOperationException(`Output with ID '${outputId}' not found`);
    }

    output.status = EOutputStatus.PUBLISHED;
    output.url = url;
    output.postedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public softDelete(deletedBy: string): void {
    const hasPublishedOutputs = this.props.outputs.some(o => o.status === EOutputStatus.PUBLISHED);
    if (hasPublishedOutputs) {
      throw new InvalidOperationException('Cannot delete participant with published outputs');
    }
    this.props.deleteAt = new Date();
    this.props.deleteBy = deletedBy;
    this.props.updatedAt = new Date();
  }

  public restore(): void {
    this.props.deleteAt = null;
    this.props.deleteBy = null;
    this.props.updatedAt = new Date();
  }

  public update(props: Partial<Omit<CampaignParticipantProps, 'createdAt' | 'updatedAt' | 'outputs' | 'deleteAt' | 'deleteBy'>>): void {
    const hasPublishedOutputs = this.props.outputs.some(o => o.status === EOutputStatus.PUBLISHED);
    if (hasPublishedOutputs) {
      throw new InvalidOperationException('Cannot update participant with published outputs');
    }
    Object.assign(this.props, props);
    this.props.updatedAt = new Date();
  }

  public updateOutputs(outputs: CampaignOutput[]): void {
    const existingPublished = this.props.outputs.filter(o => o.status === EOutputStatus.PUBLISHED);
    for (const pub of existingPublished) {
      const matched = outputs.find(o => o.id === pub.id);
      if (!matched) {
        throw new InvalidOperationException(`Cannot delete published output: ${pub.title}`);
      }
      if (matched.status !== EOutputStatus.PUBLISHED || matched.url !== pub.url) {
        throw new InvalidOperationException(`Cannot modify published output: ${pub.title}`);
      }
    }
    this.props.outputs = outputs;
    this.props.updatedAt = new Date();
  }

  public setOutputFileId(outputId: string, fileId: string): void {
    const output = this.props.outputs.find((o) => o.id === outputId);
    if (!output) {
      throw new InvalidOperationException(`Output with ID '${outputId}' not found`);
    }
    output.fileId = fileId;
    this.props.updatedAt = new Date();
  }
}
