import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { KOL_PROFILE_READ_SERVICE, type IKolProfileReadService } from '@/application/interfaces';
import { KolProfileDto } from '@/application/dtos';
import { KolProfileGetListQuery } from './kol-profile-get-list.query';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

@QueryHandler(KolProfileGetListQuery)
export class KolProfileGetListHandler implements IQueryHandler<KolProfileGetListQuery, PaginatedResponseDto<KolProfileDto>> {
  constructor(
    @Inject(KOL_PROFILE_READ_SERVICE)
    private readonly kolProfileReadService: IKolProfileReadService,
  ) {}

  async execute(query: KolProfileGetListQuery): Promise<PaginatedResponseDto<KolProfileDto>> {
    return this.kolProfileReadService.findAll(query.filters, query.projection);
  }
}
