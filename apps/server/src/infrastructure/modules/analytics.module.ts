import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { KpiLogGetListHandler } from '@/application/queries';
import { KpiLogAdminController } from '@/presentation/controllers'
import { KpiLogRmqController } from '@/presentation/controllers'
import { KpiLogCreateCommandHandler, KpiLogTerminateCommandHandler } from '@/application/commands';
import { KpiMetricsUpdatedWsHandler, KpiTrackingTerminatedWsHandler } from '@/application/events';

const COMMAND_HANDLERS = [
  KpiLogCreateCommandHandler,
  KpiLogTerminateCommandHandler
];

const QUERY_HANDLERS = [
  KpiLogGetListHandler
]

const EVENT_HANDLERS = [
  KpiMetricsUpdatedWsHandler,
  KpiTrackingTerminatedWsHandler
]

@Module({
  imports: [CqrsModule],
  controllers: [KpiLogAdminController],
  providers: [
    KpiLogRmqController,
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
    ...EVENT_HANDLERS
  ],
  exports: [],
})
export class AnalyticsModule {}