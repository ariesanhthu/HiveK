import { DomainEvent } from '../common/base.domain-event';
import { EAggregateType } from '../enums/aggregate-type.enum';

export interface CampaignParticipantCreatedPayload {
  campaignParticipantId: string;
  campaignId: string;
  kolProfileId: string;
  kolEmail?: string;
  campaignName?: string;
}

export class CampaignParticipantCreatedEvent
  extends DomainEvent<CampaignParticipantCreatedPayload>
{
  public readonly eventType = 'CampaignParticipantCreated';
  public readonly aggregateType = EAggregateType.CAMPAIGN_PARTICIPANT;

  constructor(
    aggregateId: string,
    payload: CampaignParticipantCreatedPayload,
    metadata?: Record<string, unknown>,
  ) {
    super(aggregateId, payload, metadata);
  }
}
