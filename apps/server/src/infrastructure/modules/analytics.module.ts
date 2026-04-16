import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { KpiLogModel, KpiLogSchema } from '../mongo/schemas/kpi-log.schema';
import { KPI_LOG_READ_SERVICE } from '@/application/interfaces';
import { MongoKpiLogReadService } from '../mongo/read-services/kpi-log.read-service';
import { GetKpiLogsHandler } from '@/application/analytics/queries/get-kpi-logs.handler';
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
    GetKpiLogsHandler,
  ],
  exports: [KPI_LOG_READ_SERVICE],
})
export class AnalyticsModule {}
