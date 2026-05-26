import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { EnterpriseController } from '@/presentation/controllers';
import { EnterpriseGetByIdHandler } from '@/application/queries';
import { ENTERPRISE_READ_SERVICE } from '@/application/interfaces';
import { MongoEnterpriseReadService } from '@/infrastructure/mongo/read-services';
import { EnterpriseDocument, EnterpriseModel, EnterpriseSchema } from '@/infrastructure/mongo/schemas';

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
    {
      provide: ENTERPRISE_READ_SERVICE,
      useClass: MongoEnterpriseReadService,
    },
  ],
  exports: [ENTERPRISE_READ_SERVICE],
})
export class EnterpriseModule {}
