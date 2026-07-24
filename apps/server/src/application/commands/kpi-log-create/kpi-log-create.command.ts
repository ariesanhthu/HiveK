export interface KpiLogCreatePayload {
  participantId?: string;
  outputId?: string | null;
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

export class KpiLogCreateCommand {
  constructor(public readonly payload: KpiLogCreatePayload) {}
}
