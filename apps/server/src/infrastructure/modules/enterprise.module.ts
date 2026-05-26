import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { EnterpriseController } from '@/presentation/controllers';
import { EnterpriseGetByIdHandler } from '@/application/queries';
import { ENTERPRISE_READ_SERVICE } from '@/application/interfaces';
import { ENTERPRISE_REPOSITORY } from '@/core/interfaces';
import { MongoEnterpriseReadService } from '@/infrastructure/mongo/read-services';
import { MongoEnterpriseRepository } from '@/infrastructure/mongo/repositories';
import { EnterpriseDocument, EnterpriseModel, EnterpriseSchema } from '@/infrastructure/mongo/schemas';

import { EnterpriseSoftDeleteCommandHandler, EnterpriseHardDeleteCommandHandler, EnterpriseRestoreCommandHandler } from '@/application/commands';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: EnterpriseModel.name, schema: EnterpriseSchema },
    ]),
  ],
  controllers: [EnterpriseController],
  providers: [
    EnterpriseGetByIdHandler,
    EnterpriseSoftDeleteCommandHandler,
    EnterpriseHardDeleteCommandHandler,
    EnterpriseRestoreCommandHandler,
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
export class EnterpriseModule {}
