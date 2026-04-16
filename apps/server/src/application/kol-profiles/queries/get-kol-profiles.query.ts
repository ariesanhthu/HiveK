import { Query } from '@nestjs/cqrs';
import { KolProfileDto, KolProfileFilterDto } from '../dtos';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';

export class GetKolProfilesQuery extends Query<PaginatedResponseDto<KolProfileDto>> {
  constructor(public readonly filters?: KolProfileFilterDto) {
    super();
  }
}
