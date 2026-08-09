import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  USER_NOTIFICATION_REPOSITORY,
  type IUserNotificationRepository,
} from '@/core/interfaces/repositories';
import { NotificationHardDeleteCommand } from './notification-hard-delete.command';

@CommandHandler(NotificationHardDeleteCommand)
export class NotificationHardDeleteCommandHandler implements ICommandHandler<
  NotificationHardDeleteCommand,
  void
> {
  constructor(
    @Inject(USER_NOTIFICATION_REPOSITORY)
    private readonly userNotificationRepository: IUserNotificationRepository,
  ) {}

  async execute(command: NotificationHardDeleteCommand): Promise<void> {
    const { ids, userId } = command;
    await this.userNotificationRepository.hardDeleteMany(ids, userId);
  }
}
