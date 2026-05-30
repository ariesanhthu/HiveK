import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { USER_NOTIFICATION_REPOSITORY, type IUserNotificationRepository } from '@/core/interfaces/repositories';
import { MarkAllNotificationsReadCommand } from './mark-all-notifications-read.command';

@CommandHandler(MarkAllNotificationsReadCommand)
export class MarkAllNotificationsReadCommandHandler implements ICommandHandler<MarkAllNotificationsReadCommand, void> {
  constructor(
    @Inject(USER_NOTIFICATION_REPOSITORY)
    private readonly userNotificationRepository: IUserNotificationRepository,
  ) {}

  async execute(command: MarkAllNotificationsReadCommand): Promise<void> {
    await this.userNotificationRepository.markAllRead(command.userId);
  }
}
