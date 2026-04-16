import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { KolProfileModel, KolProfileSchema } from '@/infrastructure/mongo/schemas';
import { KOL_PROFILE_READ_SERVICE } from '@/application/interfaces';
import { MongoKolProfileReadService } from '@/infrastructure/mongo/read-services';
import { GetKolProfilesHandler, GetKolProfileByIdHandler } from '@/application/kol-profiles/queries';
import { KolProfileController } from '@/presentation/controllers/kol-profile.controller';

const Handlers = [
  GetKolProfilesHandler,
  GetKolProfileByIdHandler,
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: KolProfileModel.name, schema: KolProfileSchema },
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
