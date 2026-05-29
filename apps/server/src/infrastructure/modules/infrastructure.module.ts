import { Global, Module } from '@nestjs/common';
import { LOGGER_SERVICE } from '@/application/interfaces';
import { NestLoggerService } from '../nest-logger/nest-logger.service';
import { STORAGE_SERVICE } from '@/core/interfaces/storage';
import { CloudinaryStorageService } from '../cloudinary/cloudinary-storage.service';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: LOGGER_SERVICE,
      useClass: NestLoggerService
    },
    {
      provide: STORAGE_SERVICE,
      useClass: CloudinaryStorageService
    }
  ],
  exports: [LOGGER_SERVICE, STORAGE_SERVICE],
})
export class InfrastructureModule {}
