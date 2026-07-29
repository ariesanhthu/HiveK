import { BaseAggregateRoot } from '../common/base.aggregate-root';
import { EProposalStatus } from '../enums';
import { MediaSlideVO, ProductItemVO, VoucherItemVO } from '../value-objects';
import { Nullable } from '../types';
import { ProposalInvalidStatusTransitionException } from '../exceptions/proposal.exception';

export interface CampaignProposalProps {
  campaignId: string;
  slug: string;
  title: string;
  description: string;
  mediaSlides: MediaSlideVO[];
  products: ProductItemVO[];
  vouchers: VoucherItemVO[];
  status: EProposalStatus;
  metrics: Record<string, number>;
  deleteAt: Nullable<Date>;
  deleteBy: Nullable<string>;
  createdAt: Date;
  updatedAt: Date;
}

export type CampaignProposalCreateProps = Omit<
  CampaignProposalProps,
  'metrics' | 'status' | 'deleteAt' | 'deleteBy' | 'createdAt' | 'updatedAt'
>;

export class CampaignProposalRoot extends BaseAggregateRoot<CampaignProposalProps> {
  private constructor(props: CampaignProposalProps, id?: string) {
    super(props, id);
  }

  public static create(
    props: CampaignProposalCreateProps,
  ): CampaignProposalRoot {
    const now = new Date();
    return new CampaignProposalRoot({
      ...props,
      status: EProposalStatus.ACTIVE,
      metrics: { totalViews: 0, totalClicks: 0 },
      deleteAt: null,
      deleteBy: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static instantiate(
    id: string,
    props: CampaignProposalProps,
  ): CampaignProposalRoot {
    return new CampaignProposalRoot(props, id);
  }

  get campaignId(): string {
    return this.props.campaignId;
  }

  get slug(): string {
    return this.props.slug;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get mediaSlides(): MediaSlideVO[] {
    return [...this.props.mediaSlides];
  }

  get products(): ProductItemVO[] {
    return [...this.props.products];
  }

  get vouchers(): VoucherItemVO[] {
    return [...this.props.vouchers];
  }

  get status(): EProposalStatus {
    return this.props.status;
  }

  get metrics(): Record<string, number> {
    return { ...this.props.metrics };
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

  /**
   * Update the proposal's metadata, media slides, products, or vouchers.
   */
  public update(
    props: Partial<
      Pick<
        CampaignProposalProps,
        'title' | 'description' | 'mediaSlides' | 'products' | 'vouchers'
      >
    >,
  ): void {
    Object.assign(this.props, props);
    this.props.updatedAt = new Date();
  }

  /**
   * Transition the proposal's status.
   */
  public updateStatus(newStatus: EProposalStatus): void {
    const allowedTransitions: Record<EProposalStatus, EProposalStatus[]> = {
      [EProposalStatus.ACTIVE]: [
        EProposalStatus.PAUSED,
        EProposalStatus.ARCHIVED,
      ],
      [EProposalStatus.PAUSED]: [
        EProposalStatus.ACTIVE,
        EProposalStatus.ARCHIVED,
      ],
      [EProposalStatus.ARCHIVED]: [], // Archived is terminal
    };

    const allowed = allowedTransitions[this.props.status];
    if (!allowed.includes(newStatus)) {
      throw new ProposalInvalidStatusTransitionException(
        this.props.status,
        newStatus,
      );
    }

    this.props.status = newStatus;
    this.props.updatedAt = new Date();
  }

  /**
   * Increment a metric counter (e.g., totalViews, totalClicks).
   */
  public incrementMetric(key: string, value: number = 1): void {
    const current = this.props.metrics[key] ?? 0;
    this.props.metrics[key] = current + value;
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
