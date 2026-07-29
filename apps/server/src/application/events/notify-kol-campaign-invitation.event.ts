import {
  IntegrationEvent,
  TransportMetadata,
} from '@/core/common/base.integration-event';

export interface NotifyKolCampaignInvitationPayload {
  campaignParticipantId: string;
  campaignId: string;
  kolProfileId: string;
  kolEmail?: string;
  campaignName?: string;
}

export class NotifyKolCampaignInvitationEvent extends IntegrationEvent<NotifyKolCampaignInvitationPayload> {
  public readonly eventType = 'NotifyKolCampaignInvitation';

  constructor(
    payload: NotifyKolCampaignInvitationPayload,
    public readonly metadata?: Record<string, unknown>,
    public readonly transport?: TransportMetadata,
  ) {
    super(payload, metadata, transport);
  }
}
