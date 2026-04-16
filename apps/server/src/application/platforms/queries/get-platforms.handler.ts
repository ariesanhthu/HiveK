import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PLATFORM_READ_SERVICE, type IPlatformReadService } from '@/application/interfaces';
import { PlatformDto } from '@/application/platforms/dtos';
import { JsonRecord } from '@/shared/types';

export class GetPlatformsQuery extends Query<PlatformDto[]> {
  constructor(public readonly filters?: JsonRecord) {
    super();
  }
}

@QueryHandler(GetPlatformsQuery)
export class GetPlatformsHandler implements IQueryHandler<GetPlatformsQuery, PlatformDto[]> {
  constructor(
    @Inject(PLATFORM_READ_SERVICE)
    private readonly platformReadService: IPlatformReadService,
  ) {}

  async execute(query: GetPlatformsQuery): Promise<PlatformDto[]> {
    return this.platformReadService.findAll(query.filters);
  }
}
