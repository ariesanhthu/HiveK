import { KolProfileDto } from '@/application/dtos';
import { type IKolProfileReadService, KOL_PROFILE_READ_SERVICE } from '@/application/interfaces';
import { UserNotFoundException } from '@/core/exceptions';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { KolProfileGetByIdQuery } from './kol-profile-get-by-id.query';

@QueryHandler(KolProfileGetByIdQuery)
export class KolProfileGetByIdHandler
  implements IQueryHandler<KolProfileGetByIdQuery, KolProfileDto>
{
  constructor(
    @Inject(KOL_PROFILE_READ_SERVICE) private readonly kolProfileReadService:
      IKolProfileReadService,
  ) {}

  async execute(query: KolProfileGetByIdQuery): Promise<KolProfileDto> {
    const profile = await this.kolProfileReadService.findById(query.id, query.projection);
    if (!profile) {
      throw new UserNotFoundException(query.id);
    }
    return profile;
  }
}
