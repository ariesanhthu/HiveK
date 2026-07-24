import {
  type IUserNotificationRepository,
  USER_NOTIFICATION_REPOSITORY,
} from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotificationSoftDeleteCommand } from './notification-soft-delete.command';

@CommandHandler(NotificationSoftDeleteCommand)
export class NotificationSoftDeleteCommandHandler implements
  ICommandHandler<
    NotificationSoftDeleteCommand,
    void
  >
{
  constructor(
    @Inject(USER_NOTIFICATION_REPOSITORY) private readonly userNotificationRepository:
      IUserNotificationRepository,
  ) {}

  async execute(command: NotificationSoftDeleteCommand): Promise<void> {
    const { ids, userId } = command;
    await this.userNotificationRepository.softDeleteMany(ids, userId, userId);
  }
}
