import { Resolver, Query, Args, Info } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { UseGuards } from '@nestjs/common';
import type { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import { CampaignParticipantType } from '@/infrastructure/graphql/types/campaign-participant.type';
import { CampaignParticipantFilterInput, CampaignParticipantResponse } from '@/infrastructure/graphql/types/pagination.type';
import { CampaignParticipantGetByIdQuery, CampaignParticipantGetListQuery, CampaignParticipantFilterDto } from '@/application/queries';
import { ProjectionDto } from '@/application/dtos/projection.dto';
import { JwtAuthGuard, RolesGuard } from '../middleware/guards';
import { Roles } from '../decorators/roles.decorator';
import { ERoleType } from '@/core/enums';

@Resolver(() => CampaignParticipantType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class CampaignParticipantResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query(() => CampaignParticipantType, { name: 'campaignParticipant' })
  async getCampaignParticipant(
    @Args('id') id: string,
    @Info() info: GraphQLResolveInfo,
  ) {
    const fieldsMap = graphqlFields(info);

    const projectionDto = new ProjectionDto();
    projectionDto.fields = fieldsMap;

    return this.queryBus.execute(new CampaignParticipantGetByIdQuery(id, projectionDto));
  }

  @Query(() => CampaignParticipantResponse, { name: 'campaignParticipants' })
  async getCampaignParticipants(
    @Args('filters', { type: () => CampaignParticipantFilterInput, nullable: true }) filters: CampaignParticipantFilterInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    const fieldsMap = graphqlFields(info);
    const dataFieldsMap = fieldsMap.data || {};

    const projectionDto = new ProjectionDto();
    projectionDto.fields = dataFieldsMap;

    return this.queryBus.execute(new CampaignParticipantGetListQuery(filters as any, projectionDto));
  }
}
