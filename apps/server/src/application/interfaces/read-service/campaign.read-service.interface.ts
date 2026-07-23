import { CampaignDetailDto } from '@/application/dtos';
import { CampaignFilterDto } from '@/application/queries';
import { IBaseReadService } from './base.read-service.interface';

export const CAMPAIGN_READ_SERVICE = Symbol('CAMPAIGN_READ_SERVICE');

export interface ICampaignReadService
  extends IBaseReadService<CampaignDetailDto, CampaignFilterDto>
{}
