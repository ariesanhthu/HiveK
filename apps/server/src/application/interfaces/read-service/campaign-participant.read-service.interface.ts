import { CampaignParticipantDto } from '@/application/dtos';
import { CampaignParticipantFilterDto } from '@/application/queries/campaign-participant-get-list/campaign-participant-get-list.dto';
import { IBaseReadService } from './base.read-service.interface';

export const CAMPAIGN_PARTICIPANT_READ_SERVICE = Symbol(
  'CAMPAIGN_PARTICIPANT_READ_SERVICE',
);

export type ICampaignParticipantReadService = IBaseReadService<
  CampaignParticipantDto,
  CampaignParticipantFilterDto
>;
