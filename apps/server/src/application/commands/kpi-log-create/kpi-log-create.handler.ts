import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import {
  KPI_LOG_REPOSITORY,
  type IKpiLogRepository,
} from '@/core/interfaces/repositories';
import { KpiLogEntity } from '@/core/entities/kpi-log.entity';
import { KpiLogCreateCommand } from './kpi-log-create.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { KpiMetricsUpdatedEvent } from '@/application/events';

@CommandHandler(KpiLogCreateCommand)
export class KpiLogCreateCommandHandler implements ICommandHandler<
  KpiLogCreateCommand,
  void
> {
  private readonly logger = new Logger(KpiLogCreateCommandHandler.name);

  constructor(
    @Inject(KPI_LOG_REPOSITORY)
    private readonly kpiLogRepository: IKpiLogRepository,
    private readonly eventBus: EventBus,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: KpiLogCreateCommand): Promise<void> {
    await this.uow.execute(async () => {
      const { payload } = command;

      // Extract metrics from payload. Crawler should send views, likes, comments, shares
      const views = Number(payload.metrics?.views) || 0;
      const likes = Number(payload.metrics?.likes) || 0;
      const comments = Number(payload.metrics?.comments) || 0;
      const shares = Number(payload.metrics?.shares) || 0;

      if (!payload.participantId) {
        this.logger.error(
          'Received KPI success event without participantId',
          JSON.stringify(payload),
        );
        return;
      }

      const kpiLog = KpiLogEntity.create({
        participantId: payload.participantId,
        outputId: payload.outputId || null,
        metrics: {
          views,
          likes,
          comments,
          shares,
        },
      });

      await this.kpiLogRepository.save(kpiLog);

      this.logger.log(`Saved KPI Log for participant ${payload.participantId}`);

      this.eventBus.publish(
        new KpiMetricsUpdatedEvent(payload.participantId, kpiLog.id),
      );
    });
  }
}
