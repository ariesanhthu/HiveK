import { IBaseRepository } from '../common/base.repository.interface';
import { CampaignRoot } from '../aggregate-roots/campaign.aggregate';

export const CAMPAIGN_REPOSITORY = Symbol('CAMPAIGN_REPOSITORY');

export interface ICampaignRepository extends IBaseRepository<CampaignRoot> {}
