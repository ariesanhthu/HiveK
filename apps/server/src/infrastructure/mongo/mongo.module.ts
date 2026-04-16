import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { MongoUnitOfWork } from './mongo-uow';
import { UNIT_OF_WORK } from '@/application/interfaces';
import { PlatformModel, PlatformSchema } from './schemas/platform.schema';
import { KolProfileModel, KolProfileSchema } from './schemas/kol-profile.schema';
import { PLATFORM_REPOSITORY } from '@/core/interfaces/platform.repository.interface';
import { MongoPlatformRepository } from './repositories/platform.repository';
import { KOL_PROFILE_READ_SERVICE } from '@/application/interfaces/read-service/kol-profile.read-service.interface';
import { MongoKolProfileReadService } from './read-services/kol-profile.read-service';
import { PLATFORM_READ_SERVICE } from '@/application/interfaces/read-service/platform.read-service.interface';
import { MongoPlatformReadService } from './read-services/platform.read-service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
          uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    MongooseModule.forFeature([
      { name: PlatformModel.name, schema: PlatformSchema },
      { name: KolProfileModel.name, schema: KolProfileSchema },
    ]),
  ],
  providers: [
    {
      provide: UNIT_OF_WORK,
      useClass: MongoUnitOfWork,
    },
    {
      provide: PLATFORM_REPOSITORY,
      useClass: MongoPlatformRepository,
    },
    {
      provide: KOL_PROFILE_READ_SERVICE,
      useClass: MongoKolProfileReadService,
    },
    {
      provide: PLATFORM_READ_SERVICE,
      useClass: MongoPlatformReadService,
    },
  ],
  exports: [
    UNIT_OF_WORK, 
    PLATFORM_REPOSITORY, 
    KOL_PROFILE_READ_SERVICE, 
    PLATFORM_READ_SERVICE,
    MongooseModule
  ],
})
export class MongoModule {}
