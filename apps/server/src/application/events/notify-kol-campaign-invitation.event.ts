import { IntegrationEvent } from '@/core/common/base.integration-event';

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
    metadata?: any,
    transport?: any,
  ) {
    super(payload, metadata, transport);
  }
}
