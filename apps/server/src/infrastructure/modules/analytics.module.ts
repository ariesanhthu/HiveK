import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { KpiLogGetListHandler } from '@/application/queries';
import { KpiLogController } from '@/presentation/controllers'
import { KpiLogRmqController } from '@/presentation/controllers'
import { KpiLogCreateCommandHandler, KpiLogTerminateCommandHandler } from '@/application/commands';
import { KpiMetricsUpdatedWsHandler, KpiTrackingTerminatedWsHandler } from '@/application/events';

@Module({
  imports: [CqrsModule],
  controllers: [KpiLogController],
  providers: [
    KpiLogGetListHandler, 
    KpiLogRmqController,
    KpiLogCreateCommandHandler,
    KpiLogTerminateCommandHandler,
    KpiMetricsUpdatedWsHandler,
    KpiTrackingTerminatedWsHandler
  ],
  exports: [],
})
export class AnalyticsModule {}