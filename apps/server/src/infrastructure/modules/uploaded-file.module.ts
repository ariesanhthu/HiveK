import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { UploadedFileModel, UploadedFileSchema } from '@/infrastructure/mongo/schemas';
import { UPLOADED_FILE_READ_SERVICE } from '@/application/interfaces';
import { UPLOADED_FILE_REPOSITORY } from '@/core/interfaces/repositories';
import { MongoUploadedFileReadService } from '@/infrastructure/mongo/read-services';
import { MongoUploadedFileRepository } from '@/infrastructure/mongo/repositories';
import { InfrastructureModule } from './infrastructure.module';
import { UploadedFileController } from '@/presentation/controllers/uploaded-file.controller';

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
  imports: [
    CqrsModule,
    InfrastructureModule,
    MongooseModule.forFeature([
      { name: UploadedFileModel.name, schema: UploadedFileSchema },
    ]),
  ],
  controllers: [UploadedFileController],
  providers: [
    ...Handlers,
    UploadService,
    {
      provide: UPLOADED_FILE_READ_SERVICE,
      useClass: MongoUploadedFileReadService,
    },
    {
      provide: UPLOADED_FILE_REPOSITORY,
      useClass: MongoUploadedFileRepository,
    },
  ],
  exports: [UPLOADED_FILE_READ_SERVICE, UPLOADED_FILE_REPOSITORY, UploadService],
})
export class UploadedFileModule {}
