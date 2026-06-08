import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from './infrastructure.module';
import { UploadedFileController } from '@/presentation/controllers'

import {
  UploadedFileCreateCommandHandler,
  UploadedFileBulkCreateCommandHandler,
  UploadedFileSoftDeleteCommandHandler,
  UploadedFileDeleteCommandHandler,
  UploadedFileRestoreCommandHandler,
} from '@/application/commands';

import {
  UploadedFileGetByIdHandler,
  UploadedFileGetListHandler,
} from '@/application/queries';

import { UploadService } from '@/application/services';

const Handlers = [
  UploadedFileCreateCommandHandler,
  UploadedFileBulkCreateCommandHandler,
  UploadedFileSoftDeleteCommandHandler,
  UploadedFileDeleteCommandHandler,
  UploadedFileRestoreCommandHandler,
  UploadedFileGetByIdHandler,
  UploadedFileGetListHandler,
];

@Module({
  imports: [CqrsModule, InfrastructureModule],
  controllers: [UploadedFileController],
  providers: [...Handlers, UploadService],
  exports: [UploadService],
})
export class UploadedFileModule {}