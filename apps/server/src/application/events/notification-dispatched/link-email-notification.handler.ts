import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from '@nestjs/common';
import { NotificationChannel } from '@/core/enums';
import { UserModel, UserDocument } from '@/infrastructure/mongo/schemas/user.schema';
import { NotificationDispatchedEvent } from './notification-dispatched.event';

@EventsHandler(NotificationDispatchedEvent)
export class LinkEmailNotificationHandler implements IEventHandler<NotificationDispatchedEvent> {
  private readonly logger = new Logger(LinkEmailNotificationHandler.name);

  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async handle(event: NotificationDispatchedEvent): Promise<void> {
    if (!event.channels.includes(NotificationChannel.EMAIL)) {
      return;
    }

    if (event.recipientIds.length === 0) {
      return;
    }

    // Resolve emails of active users
    const users = await this.userModel
      .find({
        _id: { $in: event.recipientIds },
        delete_at: null,
      })
      .select('email full_name')
      .lean()
      .exec();

    if (users.length === 0) {
      return;
    }

    this.logger.log(`Dispatching notifications to ${users.length} email addresses...`);

    for (const user of users) {
      this.logger.log(
        `[MailService] Email sent to ${user.full_name} (${user.email}) | Subject: ${event.payload.title} | Content: ${event.payload.content}`
      );
    }
  }
}
