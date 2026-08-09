import { BaseEntity } from '@/core/common/base.entity';
import { Nullable } from '@/core/types';

export interface KpiMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface KpiLogProps {
  timestamp: Date;
  participantId: string;
  outputId: Nullable<string>;
  metrics: KpiMetrics;
  deleteAt: Nullable<Date>;
  deleteBy: Nullable<string>;
}

export type KpiLogCreateProps = Omit<
  KpiLogProps,
  'timestamp' | 'deleteAt' | 'deleteBy'
>;

export class KpiLogEntity extends BaseEntity<KpiLogProps> {
  private constructor(props: KpiLogProps, id?: string) {
    super(props, id);
  }

  public static create(props: KpiLogCreateProps): KpiLogEntity {
    return new KpiLogEntity({
      ...props,
      timestamp: new Date(),
      deleteAt: null,
      deleteBy: null,
    });
  }

  public static instantiate(id: string, props: KpiLogProps): KpiLogEntity {
    return new KpiLogEntity(props, id);
  }

  get timestamp(): Date {
    return this.props.timestamp;
  }

  get participantId(): string {
    return this.props.participantId;
  }

  get outputId(): Nullable<string> {
    return this.props.outputId;
  }

  get metrics(): KpiMetrics {
    return this.props.metrics;
  }

  get deleteAt(): Nullable<Date> {
    return this.props.deleteAt;
  }

  get deleteBy(): Nullable<string> {
    return this.props.deleteBy;
  }

  public softDelete(deletedBy: string): void {
    this.props.deleteAt = new Date();
    this.props.deleteBy = deletedBy;
  }

  public restore(): void {
    this.props.deleteAt = null;
    this.props.deleteBy = null;
  }
}
