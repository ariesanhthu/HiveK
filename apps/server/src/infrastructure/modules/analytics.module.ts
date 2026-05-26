import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { KpiLogModel, KpiLogSchema } from '@/infrastructure/mongo/schemas';
import { KPI_LOG_READ_SERVICE } from '@/application/interfaces';
import { MongoKpiLogReadService } from '@/infrastructure/mongo/read-services';
import { KpiLogGetListHandler } from '@/application/queries';
import { KpiLogController } from '@/presentation/controllers/kpi-log.controller';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: KpiLogModel.name, schema: KpiLogSchema }]),
  ],
  controllers: [KpiLogController],
  providers: [
    {
      provide: KPI_LOG_READ_SERVICE,
      useClass: MongoKpiLogReadService,
    },
    KpiLogGetListHandler,
  ],
  exports: [KPI_LOG_READ_SERVICE],
})
export class AnalyticsModule {}
