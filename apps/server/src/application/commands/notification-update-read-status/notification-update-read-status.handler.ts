import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { USER_NOTIFICATION_REPOSITORY, type IUserNotificationRepository } from '@/core/interfaces/repositories';
import { NotificationUpdateReadStatusCommand } from './notification-update-read-status.command';

@CommandHandler(NotificationUpdateReadStatusCommand)
export class NotificationUpdateReadStatusCommandHandler implements ICommandHandler<NotificationUpdateReadStatusCommand, void> {
  constructor(
    @Inject(USER_NOTIFICATION_REPOSITORY)
    private readonly userNotificationRepository: IUserNotificationRepository,
  ) {}

  async execute(command: NotificationUpdateReadStatusCommand): Promise<void> {
    const { ids, userId, isRead } = command;
    
    if (!ids || ids.length === 0) {
      await this.userNotificationRepository.markAll(userId, isRead);
    } else {
      await this.userNotificationRepository.updateReadStatus(ids, userId, isRead);
    }
  }
}
