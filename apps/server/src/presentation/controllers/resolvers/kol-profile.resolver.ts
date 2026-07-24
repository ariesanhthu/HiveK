import { ProjectionDto } from '@/application/dtos/projection.dto';
import {
  KolProfileFilterDto,
  KolProfileGetByIdQuery,
  KolProfileGetListQuery,
} from '@/application/queries';
import { KolProfileType } from '@/infrastructure/graphql/types/kol-profile.type';
import {
  KolProfileFilterInput,
  KolProfileResponse,
} from '@/infrastructure/graphql/types/pagination.type';
import { QueryBus } from '@nestjs/cqrs';
import { Args, Info, Query, Resolver } from '@nestjs/graphql';
import { Public } from '@presentation/decorators/public.decorator';
import type { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';

@Resolver(() => KolProfileType)
export class KolProfileResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @Query(() => KolProfileType, { name: 'kolProfile' })
  async getKolProfile(
    @Args('id') id: string,
    @Info() info: GraphQLResolveInfo,
  ) {
    const fieldsMap = graphqlFields(info);

    const projectionDto = new ProjectionDto();
    projectionDto.fields = fieldsMap;

    return this.queryBus.execute(new KolProfileGetByIdQuery(id, projectionDto));
  }

  @Public()
  @Query(() => KolProfileResponse, { name: 'kolProfiles' })
  async getKolProfiles(
    @Args('filters', { type: () => KolProfileFilterInput, nullable: true }) filters:
      KolProfileFilterInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    const fieldsMap = graphqlFields(info);
    const dataFieldsMap = fieldsMap.data || {};

    const projectionDto = new ProjectionDto();
    projectionDto.fields = dataFieldsMap;

    return this.queryBus.execute(
      new KolProfileGetListQuery(filters as any, projectionDto),
    );
  }
}
