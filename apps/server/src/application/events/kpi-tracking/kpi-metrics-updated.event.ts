export class KpiMetricsUpdatedEvent {
  constructor(
    public readonly participantId: string,
    public readonly kpiLogId: string,
  ) {}
}
