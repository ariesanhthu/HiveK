import { IBaseReadService } from './base.read-service.interface';
import { CampaignDto, CampaignFilterDto } from '@/application/campaigns/dtos';

export const CAMPAIGN_READ_SERVICE = Symbol('CAMPAIGN_READ_SERVICE');

export interface ICampaignReadService extends IBaseReadService<CampaignDto, CampaignFilterDto> {}
