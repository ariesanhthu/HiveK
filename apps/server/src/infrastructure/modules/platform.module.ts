import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  PlatformCreateCommandHandler,
  PlatformUpdateCommandHandler,
  PlatformSoftDeleteCommandHandler,
  PlatformHardDeleteCommandHandler,
  PlatformRestoreCommandHandler,
} from '@/application/commands';

import { PlatformGetListHandler, PlatformGetByIdHandler } from '@/application/queries';
import { LinkPlatformIconHandler } from '@/application/events';
import { PlatformAdminController, PlatformClientController } from '@/presentation/controllers'
import { UploadedFileModule } from './uploaded-file.module';

const COMMAND_HANDLERS = [
  PlatformCreateCommandHandler,
  PlatformUpdateCommandHandler,
  PlatformSoftDeleteCommandHandler,
  PlatformHardDeleteCommandHandler,
  PlatformRestoreCommandHandler,
];

const QUERY_HANDLERS = [
  PlatformGetListHandler,
  PlatformGetByIdHandler,
];

const EVENT_HANDLERS = [
  LinkPlatformIconHandler,
];

@Module({
  imports: [CqrsModule, UploadedFileModule],
  controllers: [PlatformAdminController, PlatformClientController],
  providers: [...COMMAND_HANDLERS, ...QUERY_HANDLERS, ...EVENT_HANDLERS],
  exports: [],
})
export class PlatformModule {}