import {
  UploadedFileAdminController,
  UploadedFileClientController,
} from '@/presentation/controllers';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from './infrastructure.module';

import {
  UploadedFileBulkCreateCommandHandler,
  UploadedFileCreateCommandHandler,
  UploadedFileDeleteCommandHandler,
  UploadedFileRestoreCommandHandler,
  UploadedFileSoftDeleteCommandHandler,
} from '@/application/commands';

import { UploadedFileGetByIdHandler, UploadedFileGetListHandler } from '@/application/queries';

import { UploadService } from '@/application/services';

const COMMAND_HANDLERS = [
  UploadedFileCreateCommandHandler,
  UploadedFileBulkCreateCommandHandler,
  UploadedFileSoftDeleteCommandHandler,
  UploadedFileDeleteCommandHandler,
  UploadedFileRestoreCommandHandler,
];

const QUERY_HANDLERS = [UploadedFileGetByIdHandler, UploadedFileGetListHandler];

const EVENT_HANDLERS = [];

@Module({
  imports: [CqrsModule, InfrastructureModule],
  controllers: [UploadedFileAdminController, UploadedFileClientController],
  providers: [
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
    ...EVENT_HANDLERS,
    UploadService,
  ],
  exports: [UploadService],
})
export class UploadedFileModule {}
