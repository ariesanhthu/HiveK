import { DomainEvent, IntegrationEvent } from '@/core/common';
import {
  CampaignParticipantCreatedEvent,
  EntityHardDeletedEvent,
  UserAddedToEnterpriseEvent,
  UserRevokedFromEnterpriseEvent,
  UserSignedUpEvent,
  VerificationOtpCreatedEvent,
} from '@/core/events';
import {
  NotifyEnterpriseInvitationEvent,
  NotifyEnterpriseRevocationEvent,
  NotifyKolCampaignInvitationEvent,
  SendVerificationEmailRequestedEvent,
} from '../events';

export class EventMapper {
  /**
   * Maps a single DomainEvent to a corresponding IntegrationEvent.
   */
  public static mapToIntegrationEvent(event: DomainEvent): IntegrationEvent[] {
    switch (true) {
      case event instanceof EntityHardDeletedEvent:
        return EventMapper.mapEntityHardDeletedEvent(event as EntityHardDeletedEvent);
      case event instanceof UserSignedUpEvent:
        return EventMapper.mapUserSignedUpEvent(event as UserSignedUpEvent);
      case event instanceof VerificationOtpCreatedEvent:
        return EventMapper.mapVerificationOtpCreatedEvent(event as VerificationOtpCreatedEvent);
      case event instanceof UserAddedToEnterpriseEvent:
        return EventMapper.mapUserAddedToEnterpriseEvent(event as UserAddedToEnterpriseEvent);
      case event instanceof UserRevokedFromEnterpriseEvent:
        return EventMapper.mapUserRevokedFromEnterpriseEvent(
          event as UserRevokedFromEnterpriseEvent,
        );
      case event instanceof CampaignParticipantCreatedEvent:
        return EventMapper.mapCampaignParticipantCreatedEvent(
          event as CampaignParticipantCreatedEvent,
        );
      default:
        return [];
    }
  }

  /**
   * Maps a single DomainEvent to one or many IntegrationEvents.
   */
  public static mapToIntegrationEvents(events: DomainEvent[]): IntegrationEvent[] {
    return events.flatMap((event) => EventMapper.mapToIntegrationEvent(event));
  }

  private static mapEntityHardDeletedEvent(event: EntityHardDeletedEvent): IntegrationEvent[] {
    return [];
  }

  private static mapUserSignedUpEvent(event: UserSignedUpEvent): IntegrationEvent[] {
    return [];
  }

  private static mapVerificationOtpCreatedEvent(
    event: VerificationOtpCreatedEvent,
  ): IntegrationEvent[] {
    const e = new SendVerificationEmailRequestedEvent(
      {
        email: event.payload.email,
        otpCode: event.payload.code,
        expireAt: event.payload.expiresAt,
        type: event.payload.type,
      },
      undefined,
      {
        exchange: 'kpi_exchange',
        routingKey: 'notification.verification_otp',
      },
    );
    return [e];
  }

  private static mapUserAddedToEnterpriseEvent(
    event: UserAddedToEnterpriseEvent,
  ): IntegrationEvent[] {
    const e = new NotifyEnterpriseInvitationEvent(
      {
        userId: event.payload.userId,
        userEmail: event.payload.userEmail,
        enterpriseName: event.payload.enterpriseName || 'Enterprise',
        enterpriseId: event.payload.enterpriseId,
      },
      undefined,
      {
        exchange: 'kpi_exchange',
        routingKey: 'notification.enterprise_invitation',
      },
    );
    return [e];
  }

  private static mapUserRevokedFromEnterpriseEvent(
    event: UserRevokedFromEnterpriseEvent,
  ): IntegrationEvent[] {
    const e = new NotifyEnterpriseRevocationEvent(
      {
        userId: event.payload.userId,
        userEmail: event.payload.userEmail,
        enterpriseName: event.payload.enterpriseName || 'Enterprise',
        enterpriseId: event.payload.enterpriseId,
      },
      undefined,
      {
        exchange: 'kpi_exchange',
        routingKey: 'notification.enterprise_revocation',
      },
    );
    return [e];
  }

  private static mapCampaignParticipantCreatedEvent(
    event: CampaignParticipantCreatedEvent,
  ): IntegrationEvent[] {
    const e = new NotifyKolCampaignInvitationEvent(
      {
        campaignParticipantId: event.payload.campaignParticipantId,
        campaignId: event.payload.campaignId,
        kolProfileId: event.payload.kolProfileId,
        kolEmail: event.payload.kolEmail,
        campaignName: event.payload.campaignName,
      },
      undefined,
      {
        exchange: 'kpi_exchange',
        routingKey: 'notification.kol_campaign_invitation',
      },
    );
    return [e];
  }
}
