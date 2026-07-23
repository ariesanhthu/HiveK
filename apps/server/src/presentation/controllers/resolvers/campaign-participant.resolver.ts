import { ProjectionDto } from '@/application/dtos/projection.dto';
import {
  CampaignParticipantGetByIdQuery,
  CampaignParticipantGetListQuery,
} from '@/application/queries';
import { CampaignParticipantType } from '@/infrastructure/graphql/types/campaign-participant.type';
import {
  CampaignParticipantFilterInput,
  CampaignParticipantResponse,
} from '@/infrastructure/graphql/types/pagination.type';
import { UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Args, Info, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard, RolesGuard } from '@presentation/middleware/guards';
import type { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';

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
    @Args('filters', { type: () => CampaignParticipantFilterInput, nullable: true }) filters:
      CampaignParticipantFilterInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    const fieldsMap = graphqlFields(info);
    const dataFieldsMap = fieldsMap.data || {};

    const projectionDto = new ProjectionDto();
    projectionDto.fields = dataFieldsMap;

    return this.queryBus.execute(
      new CampaignParticipantGetListQuery(filters as any, projectionDto),
    );
  }
}
