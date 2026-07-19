import { IntegrationEvent, EventMetadata, TransportMetadata } from '@/core/common/base.integration-event';

export interface NotifyEnterpriseInvitationPayload {
  userId: string;
  userEmail: string;
  enterpriseName: string;
  enterpriseId: string;
}

export class NotifyEnterpriseInvitationEvent extends IntegrationEvent<NotifyEnterpriseInvitationPayload> {
  public readonly eventType = 'NotifyEnterpriseInvitationEmail';

  constructor(
    payload: NotifyEnterpriseInvitationPayload,
    metadata?: EventMetadata,
    transport?: TransportMetadata,
  ) {
    super(payload, metadata, transport);
  }
}
