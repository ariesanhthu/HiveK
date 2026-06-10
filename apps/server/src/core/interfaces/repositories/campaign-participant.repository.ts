import { IBaseRepository } from '../../common/base.repository.interface';
import { CampaignParticipantRoot } from '../../aggregate-roots/campaign-participant.aggregate';

export const CAMPAIGN_PARTICIPANT_REPOSITORY = Symbol('CAMPAIGN_PARTICIPANT_REPOSITORY');

export interface ICampaignParticipantRepository extends IBaseRepository<CampaignParticipantRoot> {
  findByCampaignAndKol(campaignId: string, kolProfileId: string): Promise<CampaignParticipantRoot | null>;
  findByOutputId(outputId: string): Promise<CampaignParticipantRoot | null>;
}
