import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth.module';
import { EnterpriseModule } from './enterprise.module';

// Schemas
import {
  NotificationModel,
  NotificationSchema,
  UserNotificationModel,
  UserNotificationSchema,
  UserModel,
  UserSchema,
} from '../mongo/schemas';

// Repositories
import { NOTIFICATION_REPOSITORY } from '@/core/interfaces/repositories';
import { MongoNotificationRepository } from '../mongo/repositories/notification.repository';
import { USER_NOTIFICATION_REPOSITORY } from '@/core/interfaces/repositories';
import { MongoUserNotificationRepository } from '../mongo/repositories/user-notification.repository';

// Read Service
import { NOTIFICATION_READ_SERVICE } from '@/application/interfaces';
import { MongoNotificationReadService } from '../mongo/read-services/notification.read-service';

// Command Handlers
import { NotificationSendCommandHandler } from '@/application/commands/notification-send/notification-send.handler';
import { NotificationUpdateReadStatusCommandHandler } from '@/application/commands/notification-update-read-status/notification-update-read-status.handler';
import { NotificationSoftDeleteCommandHandler } from '@/application/commands/notification-soft-delete/notification-soft-delete.handler';
import { NotificationRestoreCommandHandler } from '@/application/commands/notification-restore/notification-restore.handler';
import { NotificationHardDeleteCommandHandler } from '@/application/commands/notification-hard-delete/notification-hard-delete.handler';

// Query Handlers
import { NotificationGetListQueryHandler } from '@/application/queries/notification-get-list/notification-get-list.handler';

// Event Handlers
import { InAppNotificationHandler } from '@/application/events/notification-dispatched/in-app-notification.handler';
import { EmailNotificationHandler } from '@/application/events/notification-dispatched/email-notification.handler';

// Controller
import { NotificationController } from '@/presentation/controllers/notification.controller';

const COMMAND_HANDLERS = [
  NotificationSendCommandHandler,
  NotificationUpdateReadStatusCommandHandler,
  NotificationSoftDeleteCommandHandler,
  NotificationRestoreCommandHandler,
  NotificationHardDeleteCommandHandler,
];

const QUERY_HANDLERS = [
  NotificationGetListQueryHandler,
];

const EVENT_HANDLERS = [
  InAppNotificationHandler,
  EmailNotificationHandler,
];

@Module({
  imports: [
    CqrsModule,
    AuthModule,
    EnterpriseModule, // required to inject EnterpriseRepository
    MongooseModule.forFeature([
      { name: NotificationModel.name, schema: NotificationSchema },
      { name: UserNotificationModel.name, schema: UserNotificationSchema },
      { name: UserModel.name, schema: UserSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: MongoNotificationRepository,
    },
    {
      provide: USER_NOTIFICATION_REPOSITORY,
      useClass: MongoUserNotificationRepository,
    },
    {
      provide: NOTIFICATION_READ_SERVICE,
      useClass: MongoNotificationReadService,
    },
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
    ...EVENT_HANDLERS,
  ],
  exports: [
    NOTIFICATION_REPOSITORY,
    USER_NOTIFICATION_REPOSITORY,
  ],
})
export class NotificationModule { }
