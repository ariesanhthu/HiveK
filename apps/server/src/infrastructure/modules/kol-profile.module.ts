import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { KolProfileModel, KolProfileSchema, PlatformModel, PlatformSchema } from '@/infrastructure/mongo/schemas';
import { KOL_PROFILE_READ_SERVICE } from '@/application/interfaces';
import { KOL_PROFILE_REPOSITORY } from '@/core/interfaces/repositories';
import { MongoKolProfileReadService } from '@/infrastructure/mongo/read-services';
import { MongoKolProfileRepository } from '@/infrastructure/mongo/repositories';
import { KolProfileGetListHandler, KolProfileGetByIdHandler, KolProfileGetHandlesDevHandler } from '@/application/queries';
import { UpdateKolProfileHandler, KolProfileSoftDeleteCommandHandler, KolProfileHardDeleteCommandHandler, KolProfileRestoreCommandHandler, KolProfileVerifyPlatformAccountHandler } from '@/application/commands';
import { KolProfileController } from '@/presentation/controllers/kol-profile.controller';

const Handlers = [
  KolProfileGetListHandler,
  KolProfileGetByIdHandler,
  KolProfileGetHandlesDevHandler,
  UpdateKolProfileHandler,
  KolProfileSoftDeleteCommandHandler,
  KolProfileHardDeleteCommandHandler,
  KolProfileRestoreCommandHandler,
  KolProfileVerifyPlatformAccountHandler,
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
    {
      provide: KOL_PROFILE_REPOSITORY,
      useClass: MongoKolProfileRepository,
    },
  ],
  exports: [KOL_PROFILE_READ_SERVICE, KOL_PROFILE_REPOSITORY],
})
export class KolProfileModule { }
