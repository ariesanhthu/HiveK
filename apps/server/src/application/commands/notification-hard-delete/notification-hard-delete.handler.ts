import {
  type IUserNotificationRepository,
  USER_NOTIFICATION_REPOSITORY,
} from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotificationHardDeleteCommand } from './notification-hard-delete.command';

@CommandHandler(NotificationHardDeleteCommand)
export class NotificationHardDeleteCommandHandler implements
  ICommandHandler<
    NotificationHardDeleteCommand,
    void
  >
{
  constructor(
    @Inject(USER_NOTIFICATION_REPOSITORY) private readonly userNotificationRepository:
      IUserNotificationRepository,
  ) {}

  async execute(command: NotificationHardDeleteCommand): Promise<void> {
    const { ids, userId } = command;
    await this.userNotificationRepository.hardDeleteMany(ids, userId);
  }
}
