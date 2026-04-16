import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { PLATFORM_READ_SERVICE, type IPlatformReadService } from '@/application/interfaces';
import { PlatformDto } from '@/application/platforms/dtos';

export class GetPlatformByIdQuery extends Query<PlatformDto> {
  constructor(public readonly id: string) {
    super();
  }
}

@QueryHandler(GetPlatformByIdQuery)
export class GetPlatformByIdHandler implements IQueryHandler<GetPlatformByIdQuery, PlatformDto> {
  constructor(
    @Inject(PLATFORM_READ_SERVICE)
    private readonly platformReadService: IPlatformReadService,
  ) {}

  async execute(query: GetPlatformByIdQuery): Promise<PlatformDto> {
    const platform = await this.platformReadService.findById(query.id);
    if (!platform) {
      throw new NotFoundException(`Platform with ID ${query.id} not found`);
    }
    return platform;
  }
}
