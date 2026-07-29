import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  SOCIAL_PAGE_REPOSITORY,
  type ISocialPageRepository,
} from '@/core/interfaces/repositories';
import { SocialPageDto } from '@/application/dtos';
import { SocialPageMapper } from '@/application/mappers';
import { SocialPageGetListQuery } from './social-page-get-list.query';

@QueryHandler(SocialPageGetListQuery)
export class SocialPageGetListHandler implements IQueryHandler<
  SocialPageGetListQuery,
  SocialPageDto[]
> {
  constructor(
    @Inject(SOCIAL_PAGE_REPOSITORY)
    private readonly socialPageRepository: ISocialPageRepository,
  ) {}

  async execute(query: SocialPageGetListQuery): Promise<SocialPageDto[]> {
    const pages = await this.socialPageRepository.findByEnterpriseId(
      query.enterpriseId,
    );
    return SocialPageMapper.toListDto(pages);
  }
}
