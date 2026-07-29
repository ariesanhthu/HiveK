import {
  NotificationType,
  ETargetType,
  NotificationChannel,
} from '@/core/enums';

export interface NotificationSendCommandProps {
  type: NotificationType;
  title: string;
  content: string;
  channels: NotificationChannel[];
  targetType?: ETargetType;
  targetId?: string;
  audience: {
    broadcastType: 'all' | 'admin' | 'enterprise' | 'direct';
    enterpriseId?: string;
    userIds?: string[];
  };
}

export class NotificationSendCommand {
  constructor(public readonly props: NotificationSendCommandProps) {}
}
