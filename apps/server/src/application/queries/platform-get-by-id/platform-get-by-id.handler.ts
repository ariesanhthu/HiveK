import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { PLATFORM_READ_SERVICE, type IPlatformReadService } from '@/application/interfaces';
import { PlatformDto } from '@/application/dtos';
import { PlatformGetByIdQuery } from './platform-get-by-id.query';

@QueryHandler(PlatformGetByIdQuery)
export class PlatformGetByIdHandler implements IQueryHandler<PlatformGetByIdQuery, PlatformDto> {
  constructor(
    @Inject(PLATFORM_READ_SERVICE)
    private readonly platformReadService: IPlatformReadService,
  ) {}

  async execute(query: PlatformGetByIdQuery): Promise<PlatformDto> {
    const platform = await this.platformReadService.findById(query.id);
    if (!platform) {
      throw new NotFoundException(`Platform with ID ${query.id} not found`);
    }
    return platform;
  }
}
