import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RmqHandler } from '@/infrastructure/rabbitmq/rmq-consumer.registry';
import { NotificationSendCommand } from '@/application/commands';
import { NotificationType, NotificationChannel } from '@/core/enums';

@Controller()
export class EnterpriseUserRmqController {
  constructor(private readonly commandBus: CommandBus) {}

  @RmqHandler({
    queue: 'enterprise_user_queue',
    pattern: 'enterprise.user.added',
  })
  async handleUserAdded(data: any) {
    const { userId, enterpriseId, companyName } = data;

    // Dispatch notification command (In-app + Email/WS via event subscribers)
    await this.commandBus.execute(
      new NotificationSendCommand({
        type: NotificationType.SYSTEM,
        title: 'Added to Enterprise',
        content: `You have been added to enterprise ${companyName || enterpriseId}.`,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        audience: {
          broadcastType: 'direct',
          userIds: [userId],
        },
      }),
    );
  }

  @RmqHandler({
    queue: 'enterprise_user_queue',
    pattern: 'enterprise.user.revoked',
  })
  async handleUserRevoked(data: any) {
    const { userId, enterpriseId, companyName } = data;

    await this.commandBus.execute(
      new NotificationSendCommand({
        type: NotificationType.SYSTEM,
        title: 'Removed from Enterprise',
        content: `Your access to enterprise ${companyName || enterpriseId} has been revoked.`,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        audience: {
          broadcastType: 'direct',
          userIds: [userId],
        },
      }),
    );
  }
}
