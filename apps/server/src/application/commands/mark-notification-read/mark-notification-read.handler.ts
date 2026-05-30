import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { USER_NOTIFICATION_REPOSITORY, type IUserNotificationRepository } from '@/core/interfaces/repositories';
import { MarkNotificationReadCommand } from './mark-notification-read.command';

@CommandHandler(MarkNotificationReadCommand)
export class MarkNotificationReadCommandHandler implements ICommandHandler<MarkNotificationReadCommand, void> {
  constructor(
    @Inject(USER_NOTIFICATION_REPOSITORY)
    private readonly userNotificationRepository: IUserNotificationRepository,
  ) {}

  async execute(command: MarkNotificationReadCommand): Promise<void> {
    const { userNotificationId, userId } = command;

    const userNotification = await this.userNotificationRepository.findById(userNotificationId);
    if (!userNotification || userNotification.deleteAt) {
      throw new NotFoundException(`Notification receipt with ID ${userNotificationId} not found`);
    }

    if (userNotification.recipientId !== userId) {
      throw new ForbiddenException('You are not authorized to mark this notification as read');
    }

    userNotification.markAsRead();
    await this.userNotificationRepository.save(userNotification);
  }
}
