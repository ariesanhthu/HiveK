import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';
import { Nullable } from '@/core/types';
import { NotificationType, TargetType } from '@/core/enums';

export interface NotificationProps {
  type: NotificationType;
  title: string;
  content: string;
  targetType: Nullable<TargetType>;
  targetId: Nullable<string>;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationCreateProps = Omit<NotificationProps, 'createdAt' | 'updatedAt'>;

export class NotificationRoot extends BaseAggregateRoot<NotificationProps> {
  private constructor(props: NotificationProps, id?: string) {
    super(props, id);
  }

  public static create(props: NotificationCreateProps): NotificationRoot {
    const now = new Date();
    return new NotificationRoot({
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static instantiate(id: string, props: NotificationProps): NotificationRoot {
    return new NotificationRoot(props, id);
  }

  get type(): NotificationType {
    return this.props.type;
  }

  get title(): string {
    return this.props.title;
  }

  get content(): string {
    return this.props.content;
  }

  get targetType(): Nullable<TargetType> {
    return this.props.targetType;
  }

  get targetId(): Nullable<string> {
    return this.props.targetId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
