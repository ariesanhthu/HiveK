import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PLATFORM_READ_SERVICE, type IPlatformReadService } from '@/application/interfaces';
import { PlatformDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';
import { PlatformGetListQuery } from './platform-get-list.query';

@QueryHandler(PlatformGetListQuery)
export class PlatformGetListHandler implements IQueryHandler<PlatformGetListQuery, PaginatedResponseDto<PlatformDto>> {
  constructor(
    @Inject(PLATFORM_READ_SERVICE)
    private readonly platformReadService: IPlatformReadService,
  ) {}

  async execute(query: PlatformGetListQuery): Promise<PaginatedResponseDto<PlatformDto>> {
    return this.platformReadService.findAll(query.filters);
  }
}
