import { NotificationChannel, NotificationType, TargetType } from '@/core/enums';

export class NotificationDispatchedEvent {
  constructor(
    public readonly payload: {
      type: NotificationType;
      title: string;
      content: string;
      targetType?: TargetType;
      targetId?: string;
    },
    public readonly recipientIds: string[],
    public readonly channels: NotificationChannel[],
  ) {}
}
