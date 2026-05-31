import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { NotificationNotFoundException, NotificationForbiddenException } from '@/core/exceptions';
import { USER_NOTIFICATION_REPOSITORY, type IUserNotificationRepository } from '@/core/interfaces/repositories';
import { NotificationSoftDeleteCommand } from './notification-soft-delete.command';

@CommandHandler(NotificationSoftDeleteCommand)
export class NotificationSoftDeleteCommandHandler implements ICommandHandler<NotificationSoftDeleteCommand, void> {
  constructor(
    @Inject(USER_NOTIFICATION_REPOSITORY)
    private readonly userNotificationRepository: IUserNotificationRepository,
  ) {}

  async execute(command: NotificationSoftDeleteCommand): Promise<void> {
    const { userNotificationId, userId } = command;

    const userNotification = await this.userNotificationRepository.findById(userNotificationId);
    if (!userNotification || userNotification.deleteAt) {
      throw new NotificationNotFoundException(userNotificationId);
    }

    if (userNotification.recipientId !== userId) {
      throw new NotificationForbiddenException('You are not authorized to delete this notification');
    }

    userNotification.softDelete(userId);
    await this.userNotificationRepository.save(userNotification);
  }
}
