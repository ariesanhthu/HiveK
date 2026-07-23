import { PlatformDetailDto } from '@/application/dtos';
import { type IPlatformReadService, PLATFORM_READ_SERVICE } from '@/application/interfaces';
import { PlatformNotFoundException } from '@/core/exceptions';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PlatformGetByIdQuery } from './platform-get-by-id.query';

@QueryHandler(PlatformGetByIdQuery)
export class PlatformGetByIdHandler
  implements IQueryHandler<PlatformGetByIdQuery, PlatformDetailDto>
{
  constructor(
    @Inject(PLATFORM_READ_SERVICE) private readonly platformReadService: IPlatformReadService,
  ) {}

  async execute(query: PlatformGetByIdQuery): Promise<PlatformDetailDto> {
    const platform = await this.platformReadService.findById(query.id);
    if (!platform) {
      throw new PlatformNotFoundException(query.id);
    }
    return platform;
  }
}
