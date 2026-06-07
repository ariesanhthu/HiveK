import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { UserAddedToEnterpriseEvent } from './user-added-to-enterprise.event';
import { Logger } from '@nestjs/common';
import { NotificationSendCommand } from '@/application/commands';
import { NotificationType, NotificationChannel } from '@/core/enums';

@EventsHandler(UserAddedToEnterpriseEvent)
export class UserAddedToEnterpriseHandler implements IEventHandler<UserAddedToEnterpriseEvent> {
  private readonly logger = new Logger(UserAddedToEnterpriseHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: UserAddedToEnterpriseEvent): Promise<void> {
    const { userId, enterpriseId } = event;
    this.logger.log(`Handling UserAddedToEnterpriseEvent for user ${userId} and enterprise ${enterpriseId}`);

    // Dispatch notification command
    await this.commandBus.execute(
      new NotificationSendCommand({
        type: NotificationType.SYSTEM,
        title: 'Added to Enterprise',
        content: `You have been added to enterprise ${enterpriseId}.`,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        audience: {
          broadcastType: 'direct',
          userIds: [userId],
        },
      })
    );
  }
}
