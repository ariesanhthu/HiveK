import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY, USER_NOTIFICATION_REPOSITORY, type INotificationRepository, type IUserNotificationRepository } from '@/core/interfaces/repositories';
import { NotificationChannel } from '@/core/enums';
import { NotificationRoot, UserNotificationRoot } from '@/core/aggregate-roots';
import { NotificationDispatchedEvent } from './notification-dispatched.event';
import { WEBSOCKET_SERVICE } from '@/application/interfaces/web-socket.interface';
import type { IWebSocketService } from '@/application/interfaces/web-socket.interface';
import { LOGGER_SERVICE } from '@/application/interfaces/logger.interface';
import type { ILoggerService } from '@/application/interfaces/logger.interface';
import { InvalidOperationException } from '@/core/exceptions';

@EventsHandler(NotificationDispatchedEvent)
export class InAppNotificationHandler implements IEventHandler<NotificationDispatchedEvent> {

  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
    @Inject(USER_NOTIFICATION_REPOSITORY)
    private readonly userNotificationRepository: IUserNotificationRepository,
    @Inject(WEBSOCKET_SERVICE)
    private readonly webSocketService: IWebSocketService,
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILoggerService,
  ) {
    this.logger.setContext(InAppNotificationHandler.name);
  }

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
      throw new InvalidOperationException('Failed to save notification payload: ID not generated.');
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

    // 4. Real-time delivery via WebSockets
    for (const userNotification of userNotifications) {
      try {
        this.webSocketService.emitToUser(userNotification.recipientId, 'notification', {
          id: userNotification.id,
          notificationId: userNotification.notificationId,
          title: event.payload.title,
          content: event.payload.content,
          type: event.payload.type,
          targetType: event.payload.targetType || null,
          targetId: event.payload.targetId || null,
          isRead: userNotification.isRead,
          createdAt: userNotification.createdAt || new Date(),
        });
      } catch (wsError) {
        const errorMsg = wsError instanceof Error ? wsError.message : String(wsError);
        this.logger.error(`Failed to send real-time websocket notification to user ${userNotification.recipientId}: ${errorMsg}`);
      }
    }
  }
}
