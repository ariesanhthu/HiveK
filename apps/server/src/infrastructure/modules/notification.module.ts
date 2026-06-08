import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EnterpriseModule } from './enterprise.module';

import { NotificationSendCommandHandler } from '@/application/commands/notification-send/notification-send.handler';
import { NotificationUpdateReadStatusCommandHandler } from '@/application/commands/notification-update-read-status/notification-update-read-status.handler';
import { NotificationSoftDeleteCommandHandler } from '@/application/commands/notification-soft-delete/notification-soft-delete.handler';
import { NotificationRestoreCommandHandler } from '@/application/commands/notification-restore/notification-restore.handler';
import { NotificationHardDeleteCommandHandler } from '@/application/commands/notification-hard-delete/notification-hard-delete.handler';
import { NotificationGetListQueryHandler } from '@/application/queries/notification-get-list/notification-get-list.handler';
import { InAppNotificationHandler } from '@/application/events/notification-dispatched/in-app-notification.handler';
import { EmailNotificationHandler } from '@/application/events/notification-dispatched/email-notification.handler';
import { NotificationAdminController, NotificationClientController } from '@/presentation/controllers'

const COMMAND_HANDLERS = [
  NotificationSendCommandHandler,
  NotificationUpdateReadStatusCommandHandler,
  NotificationSoftDeleteCommandHandler,
  NotificationRestoreCommandHandler,
  NotificationHardDeleteCommandHandler,
];

const QUERY_HANDLERS = [NotificationGetListQueryHandler];

const EVENT_HANDLERS = [InAppNotificationHandler, EmailNotificationHandler];

@Module({
  imports: [CqrsModule, EnterpriseModule],
  controllers: [NotificationAdminController, NotificationClientController],
  providers: [...COMMAND_HANDLERS, ...QUERY_HANDLERS, ...EVENT_HANDLERS],
  exports: [],
})
export class NotificationModule {}