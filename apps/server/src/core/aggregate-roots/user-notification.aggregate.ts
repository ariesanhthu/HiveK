import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';
import { Nullable } from '@/core/types';

export interface UserNotificationProps {
  notificationId: string;
  recipientId: string;
  isRead: boolean;
  readAt: Nullable<Date>;
  deleteAt: Nullable<Date>;
  deleteBy: Nullable<string>;
  createdAt: Date;
  updatedAt: Date;
}

export type UserNotificationCreateProps = Omit<
  UserNotificationProps,
  'isRead' | 'readAt' | 'deleteAt' | 'deleteBy' | 'createdAt' | 'updatedAt'
>;

export class UserNotificationRoot extends BaseAggregateRoot<UserNotificationProps> {
  private constructor(props: UserNotificationProps, id?: string) {
    super(props, id);
  }

  public static create(
    props: UserNotificationCreateProps,
  ): UserNotificationRoot {
    const now = new Date();
    return new UserNotificationRoot({
      ...props,
      isRead: false,
      readAt: null,
      deleteAt: null,
      deleteBy: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static instantiate(
    id: string,
    props: UserNotificationProps,
  ): UserNotificationRoot {
    return new UserNotificationRoot(props, id);
  }

  get notificationId(): string {
    return this.props.notificationId;
  }

  get recipientId(): string {
    return this.props.recipientId;
  }

  get isRead(): boolean {
    return this.props.isRead;
  }

  get readAt(): Nullable<Date> {
    return this.props.readAt;
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

  public markAsRead(): void {
    if (!this.props.isRead) {
      this.props.isRead = true;
      this.props.readAt = new Date();
      this.props.updatedAt = new Date();
    }
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
