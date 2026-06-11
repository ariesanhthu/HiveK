import { BaseEntity } from '../common/base.entity';
import { EOutboxStatus } from '../enums';
import { Nullable } from '@/core/types';

export interface OutboxProps {
  eventType: string;
  payload: any;
  metadata: Nullable<Record<string, unknown>>;
  transport: Nullable<Record<string, unknown>>;
  status: EOutboxStatus;
  retryCount: number;
  maxRetry: number;
  errorReason: Nullable<string>;
  createdAt: Date;
  processedAt: Nullable<Date>;
}

export type OutboxCreateProps = Omit<OutboxProps, 'status' | 'retryCount' | 'createdAt' | 'processedAt' | 'errorReason'> & {
    maxRetry?: number;
};

export class OutboxEntity extends BaseEntity<OutboxProps> {
  private constructor(props: OutboxProps, id?: string) {
    super(props, id);
  }

  public static create(props: OutboxCreateProps, id?: string): OutboxEntity {
    return new OutboxEntity({
      ...props,
      maxRetry: props.maxRetry ?? 5,
      status: EOutboxStatus.PENDING,
      retryCount: 0,
      errorReason: null,
      createdAt: new Date(),
      processedAt: null,
    }, id);
  }

  public static instantiate(id: string, props: OutboxProps): OutboxEntity {
    return new OutboxEntity(props, id);
  }

  get eventType(): string {
    return this.props.eventType;
  }

  get payload(): any {
    return this.props.payload;
  }

  get metadata(): Nullable<Record<string, unknown>> {
    return this.props.metadata;
  }

  get transport(): Nullable<Record<string, unknown>> {
    return this.props.transport;
  }

  get status(): EOutboxStatus {
    return this.props.status;
  }

  get retryCount(): number {
    return this.props.retryCount;
  }

  get maxRetry(): number {
    return this.props.maxRetry;
  }

  get errorReason(): Nullable<string> {
    return this.props.errorReason;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get processedAt(): Nullable<Date> {
    return this.props.processedAt;
  }

  public markAsProcessing(): void {
    this.props.status = EOutboxStatus.PROCESSING;
  }

  public markAsDone(): void {
    this.props.status = EOutboxStatus.DONE;
    this.props.processedAt = new Date();
    this.props.errorReason = null;
  }

  public markAsFailed(reason: string): void {
    this.props.retryCount++;
    this.props.errorReason = reason;
    
    if (this.props.retryCount >= this.props.maxRetry) {
      this.props.status = EOutboxStatus.FAILED;
    } else {
      this.props.status = EOutboxStatus.PENDING; // Allow for retry
    }
  }
}
