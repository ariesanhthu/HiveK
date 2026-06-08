import { Query } from '@nestjs/cqrs';
import { KpiLogFilterDto } from './kpi-log-get-list.dto';
import { KpiLogDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

export class KpiLogGetListQuery extends Query<PaginatedResponseDto<KpiLogDto>> {
  constructor(public readonly filters?: KpiLogFilterDto) {
    super();
  }
}
