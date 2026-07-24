import {
  EventMetadata,
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

export class NotifyKolCampaignInvitationEvent
  extends IntegrationEvent<NotifyKolCampaignInvitationPayload>
{
  public readonly eventType = 'NotifyKolCampaignInvitation';

  constructor(
    payload: NotifyKolCampaignInvitationPayload,
    metadata?: EventMetadata,
    transport?: TransportMetadata,
  ) {
    super(payload, metadata, transport);
  }
}
