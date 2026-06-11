import { KpiLogEntity } from '@/core/entities/kpi-log.entity';

describe('KpiLogEntity', () => {
  const mockProps = {
    participantId: 'participant-123',
    outputId: 'output-456',
    metrics: {
      views: 100,
      likes: 10,
      comments: 5,
      shares: 2,
    },
  };

  it('should create a new KpiLogEntity', () => {
    const kpiLog = KpiLogEntity.create(mockProps);

    expect(kpiLog).toBeDefined();
    expect(kpiLog.participantId).toBe(mockProps.participantId);
    expect(kpiLog.outputId).toBe(mockProps.outputId);
    expect(kpiLog.metrics).toEqual(mockProps.metrics);
    expect(kpiLog.timestamp).toBeInstanceOf(Date);
    expect(kpiLog.deleteAt).toBeNull();
    expect(kpiLog.deleteBy).toBeNull();
  });

  it('should instantiate an existing KpiLogEntity', () => {
    const fullProps = {
      ...mockProps,
      timestamp: new Date(),
      deleteAt: null,
      deleteBy: null,
    };
    const id = 'kpi-123';
    const kpiLog = KpiLogEntity.instantiate(id, fullProps);

    expect(kpiLog.id).toBe(id);
    expect(kpiLog.timestamp).toBe(fullProps.timestamp);
  });

  it('should soft delete and restore', () => {
    const kpiLog = KpiLogEntity.create(mockProps);
    const deletor = 'admin-user';

    kpiLog.softDelete(deletor);
    expect(kpiLog.deleteAt).toBeInstanceOf(Date);
    expect(kpiLog.deleteBy).toBe(deletor);

    kpiLog.restore();
    expect(kpiLog.deleteAt).toBeNull();
    expect(kpiLog.deleteBy).toBeNull();
  });
});
