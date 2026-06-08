import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PLATFORM_READ_SERVICE, type IPlatformReadService } from '@/application/interfaces';
import { PlatformDetailDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { PlatformGetListQuery } from './platform-get-list.query';

@QueryHandler(PlatformGetListQuery)
export class PlatformGetListHandler implements IQueryHandler<PlatformGetListQuery, PaginatedResponseDto<PlatformDetailDto>> {
  constructor(
    @Inject(PLATFORM_READ_SERVICE)
    private readonly platformReadService: IPlatformReadService,
  ) {}

  async execute(query: PlatformGetListQuery): Promise<PaginatedResponseDto<PlatformDetailDto>> {
    return this.platformReadService.findAll(query.filters);
  }
}
