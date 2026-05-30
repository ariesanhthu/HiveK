import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY, USER_NOTIFICATION_REPOSITORY, type INotificationRepository, type IUserNotificationRepository } from '@/core/interfaces/repositories';
import { NotificationChannel } from '@/core/enums';
import { NotificationRoot, UserNotificationRoot } from '@/core/aggregate-roots';
import { NotificationDispatchedEvent } from './notification-dispatched.event';

@EventsHandler(NotificationDispatchedEvent)
export class LinkInAppNotificationHandler implements IEventHandler<NotificationDispatchedEvent> {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
    @Inject(USER_NOTIFICATION_REPOSITORY)
    private readonly userNotificationRepository: IUserNotificationRepository,
  ) {}

  async handle(event: NotificationDispatchedEvent): Promise<void> {
    if (!event.channels.includes(NotificationChannel.IN_APP)) {
      return;
    }

    if (event.recipientIds.length === 0) {
      return;
    }

    // 1. Create and save the single notification payload
    const notification = NotificationRoot.create({
      type: event.payload.type,
      title: event.payload.title,
      content: event.payload.content,
      targetType: event.payload.targetType || null,
      targetId: event.payload.targetId || null,
    });

    await this.notificationRepository.save(notification);

    const notificationId = notification.id;
    if (!notificationId) {
      throw new Error('Failed to save notification payload: ID not generated.');
    }

    // 2. Create UserNotification status receipts for each recipient
    const userNotifications = event.recipientIds.map((recipientId) =>
      UserNotificationRoot.create({
        notificationId,
        recipientId,
      })
    );

    // 3. Bulk save
    await this.userNotificationRepository.saveMany(userNotifications);
  }
}
