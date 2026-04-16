import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PLATFORM_READ_SERVICE, type IPlatformReadService } from '@/application/interfaces';
import { PlatformDto, PlatformFilterDto } from '@/application/platforms/dtos';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';

export class GetPlatformsQuery extends Query<PaginatedResponseDto<PlatformDto>> {
  constructor(public readonly filters?: PlatformFilterDto) {
    super();
  }
}

@QueryHandler(GetPlatformsQuery)
export class GetPlatformsHandler implements IQueryHandler<GetPlatformsQuery, PaginatedResponseDto<PlatformDto>> {
  constructor(
    @Inject(PLATFORM_READ_SERVICE)
    private readonly platformReadService: IPlatformReadService,
  ) {}

  async execute(query: GetPlatformsQuery): Promise<PaginatedResponseDto<PlatformDto>> {
    return this.platformReadService.findAll(query.filters);
  }
}
