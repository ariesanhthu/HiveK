import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { PlatformModel, PlatformSchema } from '@infrastructure/mongo/schemas';
import { PLATFORM_READ_SERVICE } from '@application/interfaces';
import { PLATFORM_REPOSITORY } from '@core/interfaces';
import { MongoPlatformReadService } from '@infrastructure/mongo/read-services';
import { MongoPlatformRepository } from '@infrastructure/mongo/repositories';
import { CreatePlatformHandler, UpdatePlatformHandler } from '@application/platforms/commands';
import { GetPlatformsHandler, GetPlatformByIdHandler } from '@application/platforms/queries';
import { PlatformController } from '@/presentation/controllers/platform.controller';

const Handlers = [
  CreatePlatformHandler,
  UpdatePlatformHandler,
  GetPlatformsHandler,
  GetPlatformByIdHandler,
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: PlatformModel.name, schema: PlatformSchema },
    ]),
  ],
  controllers: [PlatformController],
  providers: [
    ...Handlers,
    {
      provide: PLATFORM_READ_SERVICE,
      useClass: MongoPlatformReadService,
    },
    {
      provide: PLATFORM_REPOSITORY,
      useClass: MongoPlatformRepository,
    },
  ],
  exports: [PLATFORM_READ_SERVICE, PLATFORM_REPOSITORY],
})
export class PlatformModule {}
