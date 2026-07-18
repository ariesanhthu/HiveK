import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from './infrastructure.module';
import { UploadedFileAdminController, UploadedFileClientController } from '@/presentation/controllers'

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

import { UploadService, FileLinkerService } from '@/application/services';
import { IMAGE_PROCESSOR_SERVICE } from '@/application/interfaces';
import { SharpImageProcessorService } from '@/infrastructure/image-processor/sharp-image-processor.service';

const COMMAND_HANDLERS = [
  UploadedFileCreateCommandHandler,
  UploadedFileBulkCreateCommandHandler,
  UploadedFileSoftDeleteCommandHandler,
  UploadedFileDeleteCommandHandler,
  UploadedFileRestoreCommandHandler,
];

const QUERY_HANDLERS = [
  UploadedFileGetByIdHandler,
  UploadedFileGetListHandler
]

const EVENT_HANDLERS = [
]

/**
 * UploadedFileModule manages system asset uploads.
 * Repository wiring notes (Audit Note P10):
 * - USER_REPOSITORY is provided by UserModule (imported via InfrastructureModule)
 * - ENTERPRISE_REPOSITORY is provided by EnterpriseModule (imported via InfrastructureModule)
 * - PLATFORM_REPOSITORY is provided by PlatformModule (imported via InfrastructureModule)
 * - CAMPAIGN_REPOSITORY is provided by CampaignModule (imported via InfrastructureModule)
 */
@Module({
  imports: [CqrsModule, InfrastructureModule],
  controllers: [UploadedFileAdminController, UploadedFileClientController],
  providers: [
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
    ...EVENT_HANDLERS,
    UploadService,
    FileLinkerService,
    {
      provide: IMAGE_PROCESSOR_SERVICE,
      useClass: SharpImageProcessorService,
    },
  ],
  exports: [UploadService, FileLinkerService],
})
export class UploadedFileModule {}