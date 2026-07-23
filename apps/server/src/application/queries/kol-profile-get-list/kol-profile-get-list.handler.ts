import { KolProfileDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { type IKolProfileReadService, KOL_PROFILE_READ_SERVICE } from '@/application/interfaces';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { KolProfileGetListQuery } from './kol-profile-get-list.query';

@QueryHandler(KolProfileGetListQuery)
export class KolProfileGetListHandler
  implements IQueryHandler<KolProfileGetListQuery, PaginatedResponseDto<KolProfileDto>>
{
  constructor(
    @Inject(KOL_PROFILE_READ_SERVICE) private readonly kolProfileReadService:
      IKolProfileReadService,
  ) {}

  async execute(query: KolProfileGetListQuery): Promise<PaginatedResponseDto<KolProfileDto>> {
    return this.kolProfileReadService.findAll(query.filters, query.projection);
  }
}
