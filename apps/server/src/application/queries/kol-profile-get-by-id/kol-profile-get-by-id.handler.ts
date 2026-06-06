import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserNotFoundException } from '@/core/exceptions';
import { KOL_PROFILE_READ_SERVICE, type IKolProfileReadService } from '@/application/interfaces';
import { KolProfileDto } from '@/application/dtos';
import { KolProfileGetByIdQuery } from './kol-profile-get-by-id.query';

@QueryHandler(KolProfileGetByIdQuery)
export class KolProfileGetByIdHandler implements IQueryHandler<KolProfileGetByIdQuery, KolProfileDto> {
  constructor(
    @Inject(KOL_PROFILE_READ_SERVICE)
    private readonly kolProfileReadService: IKolProfileReadService,
  ) {}

  async execute(query: KolProfileGetByIdQuery): Promise<KolProfileDto> {
    const profile = await this.kolProfileReadService.findById(query.id, query.projection);
    if (!profile) {
      throw new UserNotFoundException(query.id);
    }
    return profile;
  }
}
