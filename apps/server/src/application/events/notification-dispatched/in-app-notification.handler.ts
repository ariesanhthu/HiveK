import { NotificationDispatchedEvent } from '@/application/events/notification-dispatched/notification-dispatched.event';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { NotificationRoot, UserNotificationRoot } from '@/core/aggregate-roots';
import { NotificationChannel } from '@/core/enums';
import {
  type INotificationRepository,
  type IUserNotificationRepository,
  NOTIFICATION_REPOSITORY,
  USER_NOTIFICATION_REPOSITORY,
} from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

@EventsHandler(NotificationDispatchedEvent)
export class InAppNotificationHandler implements IEventHandler<NotificationDispatchedEvent> {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY) private readonly notificationRepository:
      INotificationRepository,
    @Inject(USER_NOTIFICATION_REPOSITORY) private readonly userNotificationRepository:
      IUserNotificationRepository,
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
  ) {}

  async handle(event: NotificationDispatchedEvent): Promise<void> {
    if (!event.channels.includes(NotificationChannel.IN_APP)) {
      return;
    }

    await this.uow.execute(async () => {
      const { payload: props, recipientIds } = event;

      // 1. Create and save generic notification
      const notification = NotificationRoot.create({
        type: props.type,
        title: props.title,
        content: props.content,
        targetType: props.targetType,
        targetId: props.targetId,
      });

      await this.notificationRepository.save(notification);

      // 2. Create user-specific receipt for each recipient
      const userNotifications = recipientIds.map((recipientId) =>
        UserNotificationRoot.create({
          notificationId: notification.id,
          recipientId,
        })
      );

      await this.userNotificationRepository.saveMany(userNotifications);
    });
  }
}
