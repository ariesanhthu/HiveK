import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
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
    const profile = await this.kolProfileReadService.findById(query.id);
    if (!profile) {
      throw new NotFoundException(`KOL Profile with ID ${query.id} not found`);
    }
    return profile;
  }
}
