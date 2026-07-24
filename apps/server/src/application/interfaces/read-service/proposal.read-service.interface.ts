import { ProposalDto, ProposalFilterDto } from '@/application/dtos';
import { Nullable } from '@/core/types';
import { IBaseReadService } from './base.read-service.interface';

export const CAMPAIGN_PROPOSAL_READ_SERVICE = Symbol(
  'CAMPAIGN_PROPOSAL_READ_SERVICE',
);

export interface ICampaignProposalReadService extends
  IBaseReadService<
    ProposalDto,
    ProposalFilterDto
  >
{
  findBySlug(slug: string): Promise<Nullable<ProposalDto>>;
}
