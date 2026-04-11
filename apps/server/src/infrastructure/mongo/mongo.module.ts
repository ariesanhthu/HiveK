import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { MongoUnitOfWork } from './mongo-uow';
import { UNIT_OF_WORK } from '@/application/common';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
  ],
  providers: [
    {
      provide: UNIT_OF_WORK,
      useClass: MongoUnitOfWork,
    },
  ],
  exports: [UNIT_OF_WORK, MongooseModule],
})
export class MongoModule {}
