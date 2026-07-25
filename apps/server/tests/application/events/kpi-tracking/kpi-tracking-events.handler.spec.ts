import { Test, TestingModule } from '@nestjs/testing';
import { KpiMetricsUpdatedWsHandler, KpiTrackingTerminatedWsHandler } from '@application/events/kpi-tracking/kpi-tracking-events.handler';
import { KpiMetricsUpdatedEvent } from '@application/events/kpi-tracking/kpi-metrics-updated.event';
import { KpiTrackingTerminatedEvent } from '@application/events/kpi-tracking/kpi-tracking-terminated.event';
import { WEBSOCKET_SERVICE } from '@application/interfaces';
import { KPI_LOG_REPOSITORY, CAMPAIGN_REPOSITORY } from '@core/interfaces/repositories';

describe('KpiTrackingEventsHandlers', () => {
  let metricsHandler: KpiMetricsUpdatedWsHandler;
  let terminatedHandler: KpiTrackingTerminatedWsHandler;
  let websocketService: any;
  let kpiLogRepository: any;
  let campaignRepository: any;

  beforeEach(async () => {
    websocketService = { emitToUser: jest.fn() };
    kpiLogRepository = { findById: jest.fn() };
    campaignRepository = {
      findByParticipantId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KpiMetricsUpdatedWsHandler,
        KpiTrackingTerminatedWsHandler,
        { provide: WEBSOCKET_SERVICE, useValue: websocketService },
        { provide: KPI_LOG_REPOSITORY, useValue: kpiLogRepository },
        { provide: CAMPAIGN_REPOSITORY, useValue: campaignRepository },
      ],
    }).compile();

    metricsHandler = module.get<KpiMetricsUpdatedWsHandler>(KpiMetricsUpdatedWsHandler);
    terminatedHandler = module.get<KpiTrackingTerminatedWsHandler>(KpiTrackingTerminatedWsHandler);
  });

  describe('KpiMetricsUpdatedWsHandler', () => {
    const event = new KpiMetricsUpdatedEvent('participant-1', 'log-1', { views: 100 });

    it('should emit websocket event when campaign and log exist', async () => {
      campaignRepository.findByParticipantId.mockResolvedValue({
        id: 'campaign-1',
        participants: [{ id: 'participant-1', kolProfileId: 'kol-1' }],
      });
      kpiLogRepository.findById.mockResolvedValue({ id: 'log-1', timestamp: new Date(), metrics: { views: 100 } });

      await metricsHandler.handle(event);

      expect(websocketService.emitToUser).toHaveBeenCalledWith('kol-1', 'kpi_metrics_updated', expect.objectContaining({
        participantId: 'participant-1',
        campaignId: 'campaign-1',
        kpiLog: expect.objectContaining({ id: 'log-1' }),
      }));
    });

    it('should not emit if campaign not found', async () => {
      campaignRepository.findByParticipantId.mockResolvedValue(null);
      await metricsHandler.handle(event);
      expect(websocketService.emitToUser).not.toHaveBeenCalled();
    });

    it('should not emit if kpi log not found', async () => {
      campaignRepository.findByParticipantId.mockResolvedValue({
        id: 'campaign-1',
        participants: [{ id: 'participant-1', kolProfileId: 'kol-1' }],
      });
      kpiLogRepository.findById.mockResolvedValue(null);
      await metricsHandler.handle(event);
      expect(websocketService.emitToUser).not.toHaveBeenCalled();
    });
  });

  describe('KpiTrackingTerminatedWsHandler', () => {
    const event = new KpiTrackingTerminatedEvent('participant-1', 'output-1');

    it('should emit websocket event when campaign exists', async () => {
      campaignRepository.findByParticipantId.mockResolvedValue({
        id: 'campaign-1',
        participants: [{ id: 'participant-1', kolProfileId: 'kol-1' }],
      });

      await terminatedHandler.handle(event);

      expect(websocketService.emitToUser).toHaveBeenCalledWith('kol-1', 'kpi_tracking_terminated', {
        participantId: 'participant-1',
        campaignId: 'campaign-1',
        outputId: 'output-1',
      });
    });

    it('should not emit if campaign not found', async () => {
      campaignRepository.findByParticipantId.mockResolvedValue(null);
      await terminatedHandler.handle(event);
      expect(websocketService.emitToUser).not.toHaveBeenCalled();
    });
  });
});
