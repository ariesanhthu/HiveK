import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestConfigService } from './nest-config.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  providers: [
    NestConfigService,
  ],
  exports: [
    NestConfigService,
  ],
})
export class NestConfigModule {}
