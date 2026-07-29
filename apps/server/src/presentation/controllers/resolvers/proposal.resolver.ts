import { Resolver, Query, Args } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { CampaignProposalType } from '@/infrastructure/graphql/types/proposal.type';
import {
  CampaignProposalFilterInput,
  CampaignProposalResponse,
} from '@/infrastructure/graphql/types/pagination.type';
import {
  ProposalGetByIdQuery,
  ProposalGetListQuery,
  ProposalGetBySlugQuery,
} from '@/application/queries';
import { Public } from '@presentation/decorators/public.decorator';

@Resolver(() => CampaignProposalType)
export class CampaignProposalResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @Query(() => CampaignProposalType, { name: 'campaignProposal' })
  async getCampaignProposal(
    @Args('id', { nullable: true }) id?: string,
    @Args('slug', { nullable: true }) slug?: string,
  ) {
    if (slug) {
      return this.queryBus.execute(new ProposalGetBySlugQuery(slug));
    }
    if (id) {
      return this.queryBus.execute(new ProposalGetByIdQuery(id));
    }
    throw new BadRequestException('Either id or slug must be provided');
  }

  @Public()
  @Query(() => CampaignProposalResponse, { name: 'campaignProposals' })
  async getCampaignProposals(
    @Args('filters', {
      type: () => CampaignProposalFilterInput,
      nullable: true,
    })
    filters?: CampaignProposalFilterInput,
  ) {
    return this.queryBus.execute(new ProposalGetListQuery(filters as any));
  }
}
