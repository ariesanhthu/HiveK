import { IBaseReadService } from './base.read-service.interface';
import { CampaignParticipantDto } from '@/application/dtos';
import { CampaignParticipantFilterDto } from '@/application/queries/campaign-participant-get-list/campaign-participant-get-list.dto';

export const CAMPAIGN_PARTICIPANT_READ_SERVICE = Symbol(
  'CAMPAIGN_PARTICIPANT_READ_SERVICE',
);

export interface ICampaignParticipantReadService extends IBaseReadService<
  CampaignParticipantDto,
  CampaignParticipantFilterDto
> {}
