import { NotificationType, TargetType, NotificationChannel } from '@/core/enums';

export interface SendNotificationCommandProps {
  type: NotificationType;
  title: string;
  content: string;
  channels: NotificationChannel[];
  targetType?: TargetType;
  targetId?: string;
  audience: {
    broadcastType: 'all' | 'admin' | 'enterprise' | 'direct';
    enterpriseId?: string;
    userIds?: string[];
  };
}

export class SendNotificationCommand {
  constructor(public readonly props: SendNotificationCommandProps) {}
}
