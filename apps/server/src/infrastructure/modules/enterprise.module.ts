import { EnterpriseGetByIdHandler, EnterpriseGetListHandler } from '@/application/queries';
import { EnterpriseAdminController, EnterpriseClientController } from '@/presentation/controllers';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  EnterpriseAddUserCommandHandler,
  EnterpriseCreateCommandHandler,
  EnterpriseHardDeleteCommandHandler,
  EnterpriseRestoreCommandHandler,
  EnterpriseRevokeUserCommandHandler,
  EnterpriseSoftDeleteCommandHandler,
  EnterpriseUpdateCommandHandler,
} from '@/application/commands';

import { LinkEnterpriseLogoHandler } from '@/application/events';
import { EnterpriseUserRmqController } from '@/presentation/controllers';
import { UploadedFileModule } from './uploaded-file.module';
import { UserModule } from './user.module';

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
  EnterpriseGetListHandler,
];

const EVENT_HANDLERS = [
  LinkEnterpriseLogoHandler,
];

@Module({
  imports: [CqrsModule, UploadedFileModule, UserModule],
  controllers: [EnterpriseAdminController, EnterpriseClientController],
  providers: [
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
    ...EVENT_HANDLERS,
    EnterpriseUserRmqController,
  ],
  exports: [],
})
export class EnterpriseModule {}
