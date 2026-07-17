import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';
import { Nullable } from '@/core/types';
import { EPostStatus } from '../enums/post-status.enum';
import { PostScheduledEvent } from '../events/post-scheduled.domain-event';
import { PostPublishedEvent } from '../events/post-published.domain-event';
import { PostFailedEvent } from '../events/post-failed.domain-event';
import { InvalidOperationException } from '../exceptions';

export interface ScheduledPostProps {
  enterpriseId: string;
  socialPageId: string;
  campaignId?: string;
  platformCode: string;
  content: string;
  mediaFileIds: string[];
  scheduledAt: Date;
  status: EPostStatus;
  publishedAt: Nullable<Date>;
  platformPostId: Nullable<string>;
  failReason: Nullable<string>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ScheduledPostCreateProps = Omit<
  ScheduledPostProps,
  'status' | 'publishedAt' | 'platformPostId' | 'failReason' | 'createdAt' | 'updatedAt'
>;

export class ScheduledPostRoot extends BaseAggregateRoot<ScheduledPostProps> {
  private constructor(props: ScheduledPostProps, id?: string) {
    super(props, id);
  }

  public static create(props: ScheduledPostCreateProps, id?: string): ScheduledPostRoot {
    const now = new Date();
    return new ScheduledPostRoot({
      ...props,
      status: EPostStatus.DRAFT,
      publishedAt: null,
      platformPostId: null,
      failReason: null,
      createdAt: now,
      updatedAt: now,
    }, id);
  }

  public static instantiate(id: string, props: ScheduledPostProps): ScheduledPostRoot {
    return new ScheduledPostRoot(props, id);
  }

  get enterpriseId(): string { return this.props.enterpriseId; }
  get socialPageId(): string { return this.props.socialPageId; }
  get campaignId(): string | undefined { return this.props.campaignId; }
  get platformCode(): string { return this.props.platformCode; }
  get content(): string { return this.props.content; }
  get mediaFileIds(): string[] { return [...this.props.mediaFileIds]; }
  get scheduledAt(): Date { return this.props.scheduledAt; }
  get status(): EPostStatus { return this.props.status; }
  get publishedAt(): Nullable<Date> { return this.props.publishedAt; }
  get platformPostId(): Nullable<string> { return this.props.platformPostId; }
  get failReason(): Nullable<string> { return this.props.failReason; }
  get createdBy(): string { return this.props.createdBy; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  public schedule(scheduledAt: Date): void {
    if (this.props.status !== EPostStatus.DRAFT) {
      throw new InvalidOperationException('Post must be in draft status to schedule.');
    }
    if (scheduledAt <= new Date()) {
      throw new InvalidOperationException('Scheduled time must be in the future.');
    }
    this.props.scheduledAt = scheduledAt;
    this.props.status = EPostStatus.SCHEDULED;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new PostScheduledEvent(this.id!, {
        postId: this.id!,
        enterpriseId: this.props.enterpriseId,
        socialPageId: this.props.socialPageId,
        scheduledAt,
      })
    );
  }

  public markPublishing(): void {
    if (this.props.status !== EPostStatus.SCHEDULED) {
      throw new InvalidOperationException('Post must be in scheduled status to start publishing.');
    }
    this.props.status = EPostStatus.PUBLISHING;
    this.props.updatedAt = new Date();
  }

  public markPublished(platformPostId: string, publishedAt: Date = new Date()): void {
    if (this.props.status !== EPostStatus.PUBLISHING && this.props.status !== EPostStatus.SCHEDULED) {
      throw new InvalidOperationException('Post must be in publishing or scheduled status to mark as published.');
    }
    this.props.status = EPostStatus.PUBLISHED;
    this.props.platformPostId = platformPostId;
    this.props.publishedAt = publishedAt;
    this.props.failReason = null;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new PostPublishedEvent(this.id!, {
        postId: this.id!,
        enterpriseId: this.props.enterpriseId,
        socialPageId: this.props.socialPageId,
        platformPostId,
        publishedAt,
      })
    );
  }

  public markFailed(reason: string): void {
    if (this.props.status !== EPostStatus.PUBLISHING && this.props.status !== EPostStatus.SCHEDULED) {
      throw new InvalidOperationException('Post must be in publishing or scheduled status to mark as failed.');
    }
    this.props.status = EPostStatus.FAILED;
    this.props.failReason = reason;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new PostFailedEvent(this.id!, {
        postId: this.id!,
        enterpriseId: this.props.enterpriseId,
        socialPageId: this.props.socialPageId,
        failReason: reason,
        failedAt: new Date(),
      })
    );
  }

  public cancel(): void {
    if (this.props.status !== EPostStatus.DRAFT && this.props.status !== EPostStatus.SCHEDULED) {
      throw new InvalidOperationException('Post can only be cancelled from draft or scheduled status.');
    }
    this.props.status = EPostStatus.CANCELLED;
    this.props.updatedAt = new Date();
  }

  public reschedule(newTime: Date): void {
    if (this.props.status !== EPostStatus.FAILED && this.props.status !== EPostStatus.SCHEDULED && this.props.status !== EPostStatus.CANCELLED) {
      throw new InvalidOperationException('Post status cannot be rescheduled.');
    }
    if (newTime <= new Date()) {
      throw new InvalidOperationException('Rescheduled time must be in the future.');
    }
    this.props.scheduledAt = newTime;
    this.props.status = EPostStatus.SCHEDULED;
    this.props.failReason = null;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new PostScheduledEvent(this.id!, {
        postId: this.id!,
        enterpriseId: this.props.enterpriseId,
        socialPageId: this.props.socialPageId,
        scheduledAt: newTime,
      })
    );
  }
}
