export interface KpiLogTerminatePayload {
  participantId?: string;
  outputId?: string;
}

export class KpiLogTerminateCommand {
  constructor(public readonly payload: KpiLogTerminatePayload) {}
}
