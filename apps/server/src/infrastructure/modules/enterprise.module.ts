import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EnterpriseAdminController, EnterpriseClientController } from '@/presentation/controllers';
import { EnterpriseGetByIdHandler, EnterpriseGetListHandler } from '@/application/queries';

import {
  EnterpriseCreateCommandHandler,
  EnterpriseUpdateCommandHandler,
  EnterpriseSoftDeleteCommandHandler,
  EnterpriseHardDeleteCommandHandler,
  EnterpriseRestoreCommandHandler,
  EnterpriseAddUserCommandHandler,
  EnterpriseRevokeUserCommandHandler,
} from '@/application/commands';

import { UploadedFileModule } from './uploaded-file.module';
import { UserModule } from './user.module';
import { LinkEnterpriseLogoHandler, UserAddedToEnterpriseHandler } from '@/application/events';

const COMMAND_HANDLERS = [
  EnterpriseCreateCommandHandler,
  EnterpriseUpdateCommandHandler,
  EnterpriseSoftDeleteCommandHandler,
  EnterpriseHardDeleteCommandHandler,
  EnterpriseRestoreCommandHandler,
  EnterpriseAddUserCommandHandler,
  EnterpriseRevokeUserCommandHandler,
];

const QUERY_HANDLERS = [
  EnterpriseGetByIdHandler,
  EnterpriseGetListHandler
]

const EVENT_HANDLERS = [
  LinkEnterpriseLogoHandler,
  UserAddedToEnterpriseHandler
]

@Module({
  imports: [CqrsModule, UploadedFileModule, UserModule],
  controllers: [EnterpriseAdminController, EnterpriseClientController],
  providers: [
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
    ...EVENT_HANDLERS
  ],
  exports: [],
})
export class EnterpriseModule {}