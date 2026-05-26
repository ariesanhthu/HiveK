import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { KolProfileModel, KolProfileSchema, PlatformModel, PlatformSchema } from '@/infrastructure/mongo/schemas';
import { KOL_PROFILE_READ_SERVICE } from '@/application/interfaces';
import { MongoKolProfileReadService } from '@/infrastructure/mongo/read-services';
import { KolProfileGetListHandler, KolProfileGetByIdHandler, KolProfileGetHandlesDevHandler } from '@/application/queries';
import { UpdateKolProfileHandler } from '@/application/commands';
import { KolProfileController } from '@/presentation/controllers/kol-profile.controller';

const Handlers = [
  KolProfileGetListHandler,
  KolProfileGetByIdHandler,
  KolProfileGetHandlesDevHandler,
  UpdateKolProfileHandler,
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: KolProfileModel.name, schema: KolProfileSchema },
      { name: PlatformModel.name, schema: PlatformSchema },
    ]),
  ],
  controllers: [KolProfileController],
  providers: [
    ...Handlers,
    {
      provide: KOL_PROFILE_READ_SERVICE,
      useClass: MongoKolProfileReadService,
    },
  ],
  exports: [KOL_PROFILE_READ_SERVICE],
})
export class KolProfileModule {}
