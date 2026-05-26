import { Query } from '@nestjs/cqrs';
import { KolProfileFilterDto } from './kol-profile-get-list.dto';
import { KolProfileDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';

export class KolProfileGetListQuery extends Query<PaginatedResponseDto<KolProfileDto>> {
  constructor(public readonly filters?: KolProfileFilterDto) {
    super();
  }
}
