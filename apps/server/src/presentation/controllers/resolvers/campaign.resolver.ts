import { ProjectionDto } from '@/application/dtos/projection.dto';
import { CampaignGetByIdQuery, CampaignGetListQuery } from '@/application/queries';
import { CampaignType } from '@/infrastructure/graphql/types/campaign.type';
import {
  CampaignFilterInput,
  CampaignResponse,
} from '@/infrastructure/graphql/types/pagination.type';
import { UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Args, Info, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard, RolesGuard } from '@presentation/middleware/guards';
import type { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';

@Resolver(() => CampaignType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class CampaignResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query(() => CampaignType, { name: 'campaign' })
  async getCampaign(
    @Args('id') id: string,
    @Info() info: GraphQLResolveInfo,
  ) {
    const fieldsMap = graphqlFields(info);

    const projectionDto = new ProjectionDto();
    projectionDto.fields = fieldsMap;

    return this.queryBus.execute(new CampaignGetByIdQuery(id, projectionDto));
  }

  @Query(() => CampaignResponse, { name: 'campaigns' })
  async getCampaigns(
    @Args('filters', { type: () => CampaignFilterInput, nullable: true }) filters:
      CampaignFilterInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    const fieldsMap = graphqlFields(info);
    const dataFieldsMap = fieldsMap.data || {};

    const projectionDto = new ProjectionDto();
    projectionDto.fields = dataFieldsMap;

    return this.queryBus.execute(new CampaignGetListQuery(filters as any, projectionDto));
  }
}
