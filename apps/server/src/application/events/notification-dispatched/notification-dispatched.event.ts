import { NotificationType, ETargetType, NotificationChannel } from '@/core/enums';

export class NotificationDispatchedEvent {
  constructor(
    public readonly payload: {
      type: NotificationType;
      title: string;
      content: string;
      targetType?: ETargetType;
      targetId?: string;
    },
    public readonly recipientIds: string[],
    public readonly channels: NotificationChannel[],
  ) { }
}
