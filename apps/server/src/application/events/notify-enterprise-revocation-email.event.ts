import {
  IntegrationEvent,
  TransportMetadata,
} from '@/core/common/base.integration-event';
import { NotifyEnterpriseInvitationPayload } from './notify-enterprise-invitation-email.event';

export class NotifyEnterpriseRevocationEvent extends IntegrationEvent<NotifyEnterpriseInvitationPayload> {
  public readonly eventType = 'NotifyEnterpriseRevocationEmail';

  constructor(
    payload: NotifyEnterpriseInvitationPayload,
    public readonly metadata?: Record<string, unknown>,
    public readonly transport?: TransportMetadata,
  ) {
    super(payload, metadata, transport);
  }
}
