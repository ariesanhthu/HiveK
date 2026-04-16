import { Global, Module } from '@nestjs/common';
import { LOGGER_SERVICE } from '@/application/interfaces';
import { NestLoggerService } from '../nest-logger/nest-logger.service';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: LOGGER_SERVICE,
      useClass: NestLoggerService
    }
  ],
  exports: [LOGGER_SERVICE],
})
export class InfrastructureModule {}
