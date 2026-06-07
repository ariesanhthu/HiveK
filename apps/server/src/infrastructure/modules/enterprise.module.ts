import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { EnterpriseController } from '@/presentation/controllers';
import { EnterpriseGetByIdHandler, EnterpriseGetListHandler } from '@/application/queries';
import { ENTERPRISE_READ_SERVICE } from '@/application/interfaces';
import { ENTERPRISE_REPOSITORY } from '@/core/interfaces/repositories';
import { MongoEnterpriseReadService } from '@/infrastructure/mongo/read-services';
import { MongoEnterpriseRepository } from '@/infrastructure/mongo/repositories';
import { EnterpriseModel, EnterpriseSchema } from '@/infrastructure/mongo/schemas';

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
import { AuthModule } from './auth.module';
import { UserModule } from './user.module';

import { LinkEnterpriseLogoHandler, UserAddedToEnterpriseHandler } from '@/application/events';

@Module({
  imports: [
    CqrsModule,
    UploadedFileModule,
    AuthModule,
    UserModule,
    MongooseModule.forFeature([
      { name: EnterpriseModel.name, schema: EnterpriseSchema },
    ]),
  ],
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
    {
      provide: ENTERPRISE_READ_SERVICE,
      useClass: MongoEnterpriseReadService,
    },
    {
      provide: ENTERPRISE_REPOSITORY,
      useClass: MongoEnterpriseRepository,
    },
  ],
  exports: [ENTERPRISE_READ_SERVICE, ENTERPRISE_REPOSITORY],
})
export class EnterpriseModule { }
