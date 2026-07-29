import { IBaseReadService } from './base.read-service.interface';
import { CampaignDetailDto } from '@/application/dtos';
import { CampaignFilterDto } from '@/application/queries';

export const CAMPAIGN_READ_SERVICE = Symbol('CAMPAIGN_READ_SERVICE');

export interface ICampaignReadService extends IBaseReadService<
  CampaignDetailDto,
  CampaignFilterDto
> {}
