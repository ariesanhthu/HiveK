import { CampaignRoot } from '../../aggregate-roots/campaign.aggregate';
import { IBaseRepository } from '../../common/base.repository.interface';

export const CAMPAIGN_REPOSITORY = Symbol('CAMPAIGN_REPOSITORY');

export interface ICampaignRepository extends IBaseRepository<CampaignRoot> {
  findByEnterpriseId(enterpriseId: string): Promise<CampaignRoot[]>;
  hasActiveCampaigns(enterpriseId: string): Promise<boolean>;
  findByParticipantId(participantId: string): Promise<CampaignRoot | null>;
  findByOutputId(outputId: string): Promise<CampaignRoot | null>;
  findByCampaignAndKol(campaignId: string, kolProfileId: string): Promise<CampaignRoot | null>;
}
