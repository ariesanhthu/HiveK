import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  USER_NOTIFICATION_REPOSITORY,
  type IUserNotificationRepository,
} from '@/core/interfaces/repositories';
import { NotificationSoftDeleteCommand } from './notification-soft-delete.command';

@CommandHandler(NotificationSoftDeleteCommand)
export class NotificationSoftDeleteCommandHandler implements ICommandHandler<
  NotificationSoftDeleteCommand,
  void
> {
  constructor(
    @Inject(USER_NOTIFICATION_REPOSITORY)
    private readonly userNotificationRepository: IUserNotificationRepository,
  ) {}

  async execute(command: NotificationSoftDeleteCommand): Promise<void> {
    const { ids, userId } = command;
    await this.userNotificationRepository.softDeleteMany(ids, userId, userId);
  }
}
