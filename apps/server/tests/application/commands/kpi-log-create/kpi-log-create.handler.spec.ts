import { KpiLogCreateCommandHandler } from '@/application/commands/kpi-log-create/kpi-log-create.handler';
import { KpiLogCreateCommand } from '@/application/commands/kpi-log-create/kpi-log-create.command';
import { KpiLogEntity } from '@/core/entities/kpi-log.entity';
import { KpiMetricsUpdatedEvent } from '@/application/events';

describe('KpiLogCreateCommandHandler', () => {
  let handler: KpiLogCreateCommandHandler;
  let mockKpiLogRepository: any;
  let mockEventBus: any;
  let mockUow: any;

  beforeEach(() => {
    mockKpiLogRepository = {
      save: jest.fn().mockImplementation(async (log: KpiLogEntity) => {
        if (!log.id) log.setId('generated-kpi-id');
      }),
    };
    mockEventBus = {
      publish: jest.fn(),
    };
    mockUow = {
      execute: jest.fn((fn: any) => fn()),
    };
    handler = new KpiLogCreateCommandHandler(
      mockKpiLogRepository,
      mockEventBus,
      mockUow,
    );
  });

  it('should successfully create a KpiLog and publish event', async () => {
    const payload = {
      participantId: 'participant-123',
      outputId: 'output-456',
      metrics: {
        views: 1000,
        likes: 100,
        comments: 50,
        shares: 10,
      },
    };

    const command = new KpiLogCreateCommand(payload);
    await handler.execute(command);

    expect(mockKpiLogRepository.save).toHaveBeenCalled();
    const savedLog = mockKpiLogRepository.save.mock.calls[0][0];
    expect(savedLog.participantId).toBe(payload.participantId);
    expect(savedLog.metrics.views).toBe(1000);
    expect(mockEventBus.publish).toHaveBeenCalledWith(expect.any(KpiMetricsUpdatedEvent));
  });

  it('should return early if participantId is missing', async () => {
    const payload = {
      participantId: '',
      metrics: { views: 10 },
    };

    const command = new KpiLogCreateCommand(payload as any);
    await handler.execute(command);

    expect(mockKpiLogRepository.save).not.toHaveBeenCalled();
    expect(mockEventBus.publish).not.toHaveBeenCalled();
  });
});
