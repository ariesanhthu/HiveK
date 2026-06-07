import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EnterpriseController } from '@/presentation/controllers';
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

@Module({
  imports: [CqrsModule, UploadedFileModule, UserModule],
  controllers: [EnterpriseController],
  providers: [
    EnterpriseGetByIdHandler,
    EnterpriseGetListHandler,
    EnterpriseCreateCommandHandler,
    EnterpriseUpdateCommandHandler,
    EnterpriseSoftDeleteCommandHandler,
    EnterpriseHardDeleteCommandHandler,
    EnterpriseRestoreCommandHandler,
    EnterpriseAddUserCommandHandler,
    EnterpriseRevokeUserCommandHandler,
    LinkEnterpriseLogoHandler,
    UserAddedToEnterpriseHandler,
  ],
  exports: [],
})
export class EnterpriseModule {}