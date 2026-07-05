import { BaseAggregateRoot } from '../common/base.aggregate-root';
import { EReviewStatus } from '../enums';
import { ReviewSecurityMetadataVO } from '../value-objects';
import { Nullable } from '../types';

export interface PublicReviewProps {
  proposalId: string;
  authorName: string;
  rating: number;
  comment: string;
  status: EReviewStatus;
  securityMetadata: ReviewSecurityMetadataVO;
  deleteAt: Nullable<Date>;
  deleteBy: Nullable<string>;
  createdAt: Date;
  updatedAt: Date;
}

export type PublicReviewCreateProps = Omit<PublicReviewProps, 'status' | 'deleteAt' | 'deleteBy' | 'createdAt' | 'updatedAt'>;

export class PublicReviewRoot extends BaseAggregateRoot<PublicReviewProps> {
  private constructor(props: PublicReviewProps, id?: string) {
    super(props, id);
  }

  public static create(props: PublicReviewCreateProps): PublicReviewRoot {
    if (props.rating < 1 || props.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const now = new Date();
    return new PublicReviewRoot({
      ...props,
      status: EReviewStatus.PENDING,
      deleteAt: null,
      deleteBy: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static instantiate(id: string, props: PublicReviewProps): PublicReviewRoot {
    return new PublicReviewRoot(props, id);
  }

  get proposalId(): string {
    return this.props.proposalId;
  }

  get authorName(): string {
    return this.props.authorName;
  }

  get rating(): number {
    return this.props.rating;
  }

  get comment(): string {
    return this.props.comment;
  }

  get status(): EReviewStatus {
    return this.props.status;
  }

  get securityMetadata(): ReviewSecurityMetadataVO {
    return this.props.securityMetadata;
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

  public approve(): void {
    if (this.props.status !== EReviewStatus.PENDING) {
      throw new Error('Can only approve a review that is in PENDING status');
    }
    this.props.status = EReviewStatus.APPROVED;
    this.props.updatedAt = new Date();
  }

  public reject(): void {
    if (this.props.status !== EReviewStatus.PENDING) {
      throw new Error('Can only reject a review that is in PENDING status');
    }
    this.props.status = EReviewStatus.REJECTED;
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
