import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { KpiLogCreateCommandHandler, KpiLogTerminateCommandHandler } from '@/application/commands';
import { KpiMetricsUpdatedWsHandler, KpiTrackingTerminatedWsHandler } from '@/application/events';
import { KpiLogGetListHandler } from '@/application/queries';

import { KpiLogAdminController, KpiLogRmqController } from '@/presentation/controllers';

const COMMAND_HANDLERS = [
  KpiLogCreateCommandHandler,
  KpiLogTerminateCommandHandler,
];

const QUERY_HANDLERS = [KpiLogGetListHandler];

const EVENT_HANDLERS = [
  KpiMetricsUpdatedWsHandler,
  KpiTrackingTerminatedWsHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [KpiLogAdminController],
  providers: [
    KpiLogRmqController,
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
    ...EVENT_HANDLERS,
  ],
  exports: [],
})
export class AnalyticsModule {}
