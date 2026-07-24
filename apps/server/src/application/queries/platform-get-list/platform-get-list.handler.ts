import { PlatformDetailDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { type IPlatformReadService, PLATFORM_READ_SERVICE } from '@/application/interfaces';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PlatformGetListQuery } from './platform-get-list.query';

@QueryHandler(PlatformGetListQuery)
export class PlatformGetListHandler implements
  IQueryHandler<
    PlatformGetListQuery,
    PaginatedResponseDto<PlatformDetailDto>
  >
{
  constructor(
    @Inject(PLATFORM_READ_SERVICE) private readonly platformReadService: IPlatformReadService,
  ) {}

  async execute(
    query: PlatformGetListQuery,
  ): Promise<PaginatedResponseDto<PlatformDetailDto>> {
    return this.platformReadService.findAll(query.filters);
  }
}
