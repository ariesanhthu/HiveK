import {
  type IUserNotificationRepository,
  USER_NOTIFICATION_REPOSITORY,
} from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotificationRestoreCommand } from './notification-restore.command';

@CommandHandler(NotificationRestoreCommand)
export class NotificationRestoreCommandHandler implements
  ICommandHandler<
    NotificationRestoreCommand,
    void
  >
{
  constructor(
    @Inject(USER_NOTIFICATION_REPOSITORY) private readonly userNotificationRepository:
      IUserNotificationRepository,
  ) {}

  async execute(command: NotificationRestoreCommand): Promise<void> {
    const { ids, userId } = command;
    await this.userNotificationRepository.restoreMany(ids, userId);
  }
}
