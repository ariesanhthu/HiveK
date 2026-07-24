import {
  EventMetadata,
  IntegrationEvent,
  TransportMetadata,
} from '@/core/common/base.integration-event';
import { NotifyEnterpriseInvitationPayload } from './notify-enterprise-invitation-email.event';

export class NotifyEnterpriseRevocationEvent
  extends IntegrationEvent<NotifyEnterpriseInvitationPayload>
{
  public readonly eventType = 'NotifyEnterpriseRevocationEmail';

  constructor(
    payload: NotifyEnterpriseInvitationPayload,
    metadata?: EventMetadata,
    transport?: TransportMetadata,
  ) {
    super(payload, metadata, transport);
  }
}
