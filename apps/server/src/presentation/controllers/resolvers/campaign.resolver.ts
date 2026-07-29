import { Resolver, Query, Args, Info } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { UseGuards } from '@nestjs/common';
import type { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import { CampaignType } from '@/infrastructure/graphql/types/campaign.type';
import {
  CampaignFilterInput,
  CampaignResponse,
} from '@/infrastructure/graphql/types/pagination.type';
import {
  CampaignGetByIdQuery,
  CampaignGetListQuery,
} from '@/application/queries';
import { ProjectionDto } from '@/application/dtos/projection.dto';
import { JwtAuthGuard, RolesGuard } from '@presentation/middleware/guards';

@Resolver(() => CampaignType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class CampaignResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query(() => CampaignType, { name: 'campaign' })
  async getCampaign(@Args('id') id: string, @Info() info: GraphQLResolveInfo) {
    const fieldsMap = graphqlFields(info);

    const projectionDto = new ProjectionDto();
    projectionDto.fields = fieldsMap;

    return this.queryBus.execute(new CampaignGetByIdQuery(id, projectionDto));
  }

  @Query(() => CampaignResponse, { name: 'campaigns' })
  async getCampaigns(
    @Args('filters', { type: () => CampaignFilterInput, nullable: true })
    filters: CampaignFilterInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    const fieldsMap = graphqlFields(info);
    const dataFieldsMap = fieldsMap.data || {};

    const projectionDto = new ProjectionDto();
    projectionDto.fields = dataFieldsMap;

    return this.queryBus.execute(
      new CampaignGetListQuery(filters as any, projectionDto),
    );
  }
}
