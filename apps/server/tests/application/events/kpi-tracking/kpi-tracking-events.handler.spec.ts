import { KpiMetricsUpdatedEvent } from '@application/events/kpi-tracking/kpi-metrics-updated.event';
import {
  KpiMetricsUpdatedWsHandler,
  KpiTrackingTerminatedWsHandler,
} from '@application/events/kpi-tracking/kpi-tracking-events.handler';
import { KpiTrackingTerminatedEvent } from '@application/events/kpi-tracking/kpi-tracking-terminated.event';
import { WEBSOCKET_SERVICE } from '@application/interfaces';
import { CAMPAIGN_PARTICIPANT_REPOSITORY, KPI_LOG_REPOSITORY } from '@core/interfaces/repositories';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockCampaignParticipantRepository,
  createMockKpiLogRepository,
} from '../../../__mocks__/mock-repositories';
import { createMockWebSocketService } from '../../../__mocks__/mock-services';

describe('KpiTrackingEventsHandlers', () => {
  let metricsHandler: KpiMetricsUpdatedWsHandler;
  let terminatedHandler: KpiTrackingTerminatedWsHandler;
  let websocketService: any;
  let kpiLogRepository: any;
  let participantRepository: any;

  beforeEach(async () => {
    websocketService = createMockWebSocketService();
    kpiLogRepository = createMockKpiLogRepository();
    participantRepository = createMockCampaignParticipantRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KpiMetricsUpdatedWsHandler,
        KpiTrackingTerminatedWsHandler,
        { provide: WEBSOCKET_SERVICE, useValue: websocketService },
        { provide: KPI_LOG_REPOSITORY, useValue: kpiLogRepository },
        { provide: CAMPAIGN_PARTICIPANT_REPOSITORY, useValue: participantRepository },
      ],
    }).compile();

    metricsHandler = module.get<KpiMetricsUpdatedWsHandler>(KpiMetricsUpdatedWsHandler);
    terminatedHandler = module.get<KpiTrackingTerminatedWsHandler>(KpiTrackingTerminatedWsHandler);
  });

  describe('KpiMetricsUpdatedWsHandler', () => {
    const event = new KpiMetricsUpdatedEvent('participant-1', 'log-1', { views: 100 });

    it('should emit websocket event when participant and log exist', async () => {
      participantRepository.findById.mockResolvedValue({
        id: 'participant-1',
        kolProfileId: 'kol-1',
        campaignId: 'campaign-1',
      });
      kpiLogRepository.findById.mockResolvedValue({
        id: 'log-1',
        timestamp: new Date(),
        metrics: { views: 100 },
      });

      await metricsHandler.handle(event);

      expect(websocketService.emitToUser).toHaveBeenCalledWith(
        'kol-1',
        'kpi_metrics_updated',
        expect.objectContaining({
          participantId: 'participant-1',
          campaignId: 'campaign-1',
          kpiLog: expect.objectContaining({ id: 'log-1' }),
        }),
      );
    });

    it('should not emit if participant not found', async () => {
      participantRepository.findById.mockResolvedValue(null);
      await metricsHandler.handle(event);
      expect(websocketService.emitToUser).not.toHaveBeenCalled();
    });

    it('should not emit if kpi log not found', async () => {
      participantRepository.findById.mockResolvedValue({
        id: 'participant-1',
        kolProfileId: 'kol-1',
      });
      kpiLogRepository.findById.mockResolvedValue(null);
      await metricsHandler.handle(event);
      expect(websocketService.emitToUser).not.toHaveBeenCalled();
    });
  });

  describe('KpiTrackingTerminatedWsHandler', () => {
    const event = new KpiTrackingTerminatedEvent('participant-1', 'output-1');

    it('should emit websocket event when participant exists', async () => {
      participantRepository.findById.mockResolvedValue({
        id: 'participant-1',
        kolProfileId: 'kol-1',
        campaignId: 'campaign-1',
      });

      await terminatedHandler.handle(event);

      expect(websocketService.emitToUser).toHaveBeenCalledWith('kol-1', 'kpi_tracking_terminated', {
        participantId: 'participant-1',
        campaignId: 'campaign-1',
        outputId: 'output-1',
      });
    });

    it('should not emit if participant not found', async () => {
      participantRepository.findById.mockResolvedValue(null);
      await terminatedHandler.handle(event);
      expect(websocketService.emitToUser).not.toHaveBeenCalled();
    });
  });
});
