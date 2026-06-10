export class KpiTrackingTerminatedEvent {
  constructor(
    public readonly participantId: string,
    public readonly outputId: string,
  ) {}
}
