import { Injectable, Logger, Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { KpiMetricsUpdatedEvent } from './kpi-metrics-updated.event';
import { KpiTrackingTerminatedEvent } from './kpi-tracking-terminated.event';
import {
  WEBSOCKET_SERVICE,
  type IWebSocketService,
} from '@/application/interfaces';
import {
  KPI_LOG_REPOSITORY,
  type IKpiLogRepository,
  CAMPAIGN_REPOSITORY,
  type ICampaignRepository,
} from '@/core/interfaces/repositories';

@EventsHandler(KpiMetricsUpdatedEvent)
export class KpiMetricsUpdatedWsHandler implements IEventHandler<KpiMetricsUpdatedEvent> {
  private readonly logger = new Logger(KpiMetricsUpdatedWsHandler.name);

  constructor(
    @Inject(WEBSOCKET_SERVICE)
    private readonly websocketService: IWebSocketService,
    @Inject(KPI_LOG_REPOSITORY)
    private readonly kpiLogRepository: IKpiLogRepository,
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) {}

  async handle(event: KpiMetricsUpdatedEvent) {
    const { participantId, kpiLogId } = event;

    const campaign =
      await this.campaignRepository.findByParticipantId(participantId);
    if (!campaign) return;

    const participant = campaign.participants.find(
      (p) => p.id === participantId,
    );
    if (!participant) return;

    const kpiLog = await this.kpiLogRepository.findById(kpiLogId);
    if (!kpiLog) return;

    // Notify the KOL
    this.websocketService.emitToUser(
      participant.kolProfileId,
      'kpi_metrics_updated',
      {
        participantId,
        campaignId: campaign.id,
        kpiLog: {
          id: kpiLog.id,
          timestamp: kpiLog.timestamp,
          metrics: kpiLog.metrics,
        },
      },
    );

    this.logger.log(
      `Pushed kpi_metrics_updated socket event to user_${participant.kolProfileId}`,
    );
  }
}

@EventsHandler(KpiTrackingTerminatedEvent)
export class KpiTrackingTerminatedWsHandler implements IEventHandler<KpiTrackingTerminatedEvent> {
  private readonly logger = new Logger(KpiTrackingTerminatedWsHandler.name);

  constructor(
    @Inject(WEBSOCKET_SERVICE)
    private readonly websocketService: IWebSocketService,
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) {}

  async handle(event: KpiTrackingTerminatedEvent) {
    const { participantId, outputId } = event;

    const campaign =
      await this.campaignRepository.findByParticipantId(participantId);
    if (!campaign) return;

    const participant = campaign.participants.find(
      (p) => p.id === participantId,
    );
    if (!participant) return;

    // Notify the KOL
    this.websocketService.emitToUser(
      participant.kolProfileId,
      'kpi_tracking_terminated',
      {
        participantId,
        campaignId: campaign.id,
        outputId,
      },
    );

    this.logger.log(
      `Pushed kpi_tracking_terminated socket event to user_${participant.kolProfileId}`,
    );
  }
}
