import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { KOL_PROFILE_READ_SERVICE, type IKolProfileReadService } from '@/application/interfaces';
import { KolProfileDto } from '@/application/kol-profiles/dtos';
import { GetKolProfilesQuery } from '../get-kol-profiles.query';

@QueryHandler(GetKolProfilesQuery)
export class GetKolProfilesHandler implements IQueryHandler<GetKolProfilesQuery, KolProfileDto[]> {
  constructor(
    @Inject(KOL_PROFILE_READ_SERVICE)
    private readonly kolProfileReadService: IKolProfileReadService,
  ) {}

  async execute(query: GetKolProfilesQuery): Promise<KolProfileDto[]> {
    return this.kolProfileReadService.findAll(query.filters);
  }
}
