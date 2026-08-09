import { IBaseRepository } from '../../common/base.repository.interface';
import { CampaignProposalRoot } from '../../aggregate-roots/campaign-proposal.aggregate';
import { Nullable } from '../../types';

export const CAMPAIGN_PROPOSAL_REPOSITORY = Symbol(
  'CAMPAIGN_PROPOSAL_REPOSITORY',
);

export interface ICampaignProposalRepository extends IBaseRepository<CampaignProposalRoot> {
  findBySlug(slug: string): Promise<Nullable<CampaignProposalRoot>>;
  findByCampaignId(campaignId: string): Promise<Nullable<CampaignProposalRoot>>;
}
