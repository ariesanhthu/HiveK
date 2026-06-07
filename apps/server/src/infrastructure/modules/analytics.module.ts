import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { KpiLogGetListHandler } from '@/application/queries';
import { KpiLogController } from '@/presentation/controllers/kpi-log.controller';

@Module({
  imports: [CqrsModule],
  controllers: [KpiLogController],
  providers: [KpiLogGetListHandler],
  exports: [],
})
export class AnalyticsModule {}