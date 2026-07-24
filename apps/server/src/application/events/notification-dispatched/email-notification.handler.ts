import { LOGGER_SERVICE } from '@/application/interfaces/logger.interface';
import type { ILoggerService } from '@/application/interfaces/logger.interface';
import { MAILER_SERVICE } from '@/application/interfaces/mailer.interface';
import type { IMailerService } from '@/application/interfaces/mailer.interface';
import { NotificationChannel } from '@/core/enums';
import { UserDocument, UserModel } from '@/infrastructure/mongo/schemas/user.schema';
import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationDispatchedEvent } from './notification-dispatched.event';

@EventsHandler(NotificationDispatchedEvent)
export class EmailNotificationHandler implements IEventHandler<NotificationDispatchedEvent> {
  constructor(
    @InjectModel(UserModel.name) private readonly userModel: Model<UserDocument>,
    @Inject(MAILER_SERVICE) private readonly mailerService: IMailerService,
    @Inject(LOGGER_SERVICE) private readonly logger: ILoggerService,
  ) {
    this.logger.setContext(EmailNotificationHandler.name);
  }

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

    this.logger.log(
      `Dispatching notifications to ${users.length} email addresses...`,
    );

    for (const user of users) {
      try {
        await this.mailerService.sendMail({
          to: user.email,
          subject: event.payload.title,
          template: 'test',
          context: {
            name: user.full_name,
            message: event.payload.content,
          },
          text: event.payload.content,
        });
      } catch (mailError) {
        const errorMsg = mailError instanceof Error ? mailError.message : String(mailError);
        this.logger.error(
          `Failed to send notification email to ${user.email}: ${errorMsg}`,
        );
      }
    }
  }
}
