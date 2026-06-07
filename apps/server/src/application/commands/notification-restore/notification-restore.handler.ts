import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { USER_NOTIFICATION_REPOSITORY, type IUserNotificationRepository } from '@/core/interfaces/repositories';
import { NotificationRestoreCommand } from './notification-restore.command';

@CommandHandler(NotificationRestoreCommand)
export class NotificationRestoreCommandHandler implements ICommandHandler<NotificationRestoreCommand, void> {
  constructor(
    @Inject(USER_NOTIFICATION_REPOSITORY)
    private readonly userNotificationRepository: IUserNotificationRepository,
  ) {}

  async execute(command: NotificationRestoreCommand): Promise<void> {
    const { ids, userId } = command;
    await this.userNotificationRepository.restoreMany(ids, userId);
  }
}
