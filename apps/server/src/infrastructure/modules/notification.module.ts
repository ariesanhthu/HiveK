import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EnterpriseModule } from './enterprise.module';

import {
  NotificationSendCommandHandler,
  NotificationUpdateReadStatusCommandHandler,
  NotificationSoftDeleteCommandHandler,
  NotificationRestoreCommandHandler,
  NotificationHardDeleteCommandHandler,
} from '@/application/commands';

import {
  NotificationGetListQueryHandler
} from '@/application/queries';

import {
  InAppNotificationHandler,
  EmailNotificationHandler
} from '@/application/events';

import {
  NotificationAdminController,
  NotificationClientController
} from '@/presentation/controllers'

import { NotificationRmqController } from '@/presentation/controllers';

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
  providers: [...COMMAND_HANDLERS, ...QUERY_HANDLERS, ...EVENT_HANDLERS, NotificationRmqController],
  exports: [],
})
export class NotificationModule { }