import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { KOL_PROFILE_READ_SERVICE, type IKolProfileReadService } from '@/application/interfaces';
import { KolProfileDto } from '@/application/kol-profiles/dtos';
import { GetKolProfileByIdQuery } from '../get-kol-profile-by-id.query';

@QueryHandler(GetKolProfileByIdQuery)
export class GetKolProfileByIdHandler implements IQueryHandler<GetKolProfileByIdQuery, KolProfileDto> {
  constructor(
    @Inject(KOL_PROFILE_READ_SERVICE)
    private readonly kolProfileReadService: IKolProfileReadService,
  ) {}

  async execute(query: GetKolProfileByIdQuery): Promise<KolProfileDto> {
    const profile = await this.kolProfileReadService.findById(query.id);
    if (!profile) {
      throw new NotFoundException(`KOL Profile with ID ${query.id} not found`);
    }
    return profile;
  }
}
